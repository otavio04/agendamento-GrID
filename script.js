const URL_API = "https://script.google.com/macros/s/AKfycbxbLYAFBdVjsyz3P7rQA5WF610FxjWC68ZD-xY9zzBKNgJ98qyBF_iGZD5C2mgJ0rWa/exec";

const corpoAgenda = document.getElementById('corpo-agenda');
const seletorData = document.getElementById('data');
const seletorMaquina = document.getElementById('maquina');
let reservasGlobais = {};
// Esta "sacola" guarda as chaves selecionadas de vários dias/máquinas
let selecoesTemporarias = new Set(); 

function configurarDataAtual() {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('data').value = dataFormatada;
}

configurarDataAtual();

async function carregarReservas() {
    corpoAgenda.innerHTML = '<tr><td colspan="3">Carregando horários...</td></tr>';
    try {
        const response = await fetch(URL_API);
        reservasGlobais = await response.json();
        atualizarAgenda();
    } catch (e) {
        corpoAgenda.innerHTML = '<tr><td colspan="3">Erro ao carregar dados.</td></tr>';
    }
}

function atualizarAgenda() {
    corpoAgenda.innerHTML = '';
    const dataSelecionada = seletorData.value;
    const maquinaSelecionada = seletorMaquina.value;

    for (let hora = 0; hora < 24; hora++) {
        const horarioFormatado = `${hora}:00 - ${hora + 1}:00`;
        const chaveReserva = `${dataSelecionada}-M${maquinaSelecionada}-${hora}`;
        const nomeReserva = reservasGlobais[chaveReserva];

        // Verifica se esta chave já está na nossa "sacola" de seleções
        const estaMarcado = selecoesTemporarias.has(chaveReserva) ? 'checked' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${horarioFormatado}</td>
            <td class="${nomeReserva ? 'ocupado' : 'disponivel'}">
                ${nomeReserva ? `Reservado por: ${nomeReserva}` : 'Disponível'}
            </td>
            <td>
                ${nomeReserva 
                    ? '---' 
                    : `<input type="checkbox" class="chk-reserva" value="${chaveReserva}" ${estaMarcado} onchange="gerenciarSelecao(this)">`
                }
            </td>
        `;
        corpoAgenda.appendChild(tr);
    }
}

// Função que adiciona ou remove da "sacola" ao clicar no checkbox
function gerenciarSelecao(checkbox) {
    if (checkbox.checked) {
        selecoesTemporarias.add(checkbox.value);
    } else {
        selecoesTemporarias.delete(checkbox.value);
    }
    
    // Opcional: Atualiza o texto do botão com a contagem
    const btn = document.getElementById('btn-confirmar');
    btn.innerText = selecoesTemporarias.size > 0 
        ? `Confirmar ${selecoesTemporarias.size} reserva(s)` 
        : "Confirmar Reservas Selecionadas";
}

async function reservarSelecionados() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const orientador = document.getElementById('orientador').value;
    const senhaInformada = document.getElementById('senha-lab').value;

    if (!senhaInformada) return alert("Digite a senha do laboratório!");
    if (!nome || !email || !orientador) return alert("Preencha todos os dados!");
    if (selecoesTemporarias.size === 0) return alert("Selecione pelo menos um horário!");

    const btn = document.getElementById('btn-confirmar');
    btn.disabled = true;
    const textoOriginal = btn.innerText;
    btn.innerText = "Processando reservas...";

    // Agora iteramos sobre a nossa "sacola" (Set)
    for (let chave of selecoesTemporarias) {
        // Extraímos a data e máquina da própria chave (Formato: YYYY-MM-DD-M1-H)
        const partes = chave.split('-');
        const dataAgend = `${partes[0]}-${partes[1]}-${partes[2]}`;
        const numMaquina = partes[3].replace('M', '');

        try {
            const response = await fetch(URL_API, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'reservar', 
                    senha: senhaInformada,
                    chave: chave, 
                    nome: nome,
                    email: email,
                    orientador: orientador,
                    dataAgendamento: dataAgend,
                    maquina: `Computador 0${numMaquina}` // Ajusta conforme seus nomes no HTML
                })
            });

            const resultado = await response.text();
            
            if (resultado.includes("Erro: Senha Incorreta")) {
                alert("A senha informada está incorreta!");
                btn.disabled = false;
                btn.innerText = textoOriginal;
                return;
            }
        } catch (e) {
            console.error("Erro ao reservar chave: " + chave);
        }
    }

    alert("Todas as reservas foram concluídas com sucesso!");
    selecoesTemporarias.clear(); // Limpa a sacola após o sucesso
    document.getElementById('senha-lab').value = "";
    btn.disabled = false;
    btn.innerText = "Confirmar Reservas Selecionadas";
    carregarReservas();
}

seletorData.addEventListener('change', atualizarAgenda);
seletorMaquina.addEventListener('change', atualizarAgenda);
carregarReservas();

// const URL_API = "https://script.google.com/macros/s/AKfycbxbLYAFBdVjsyz3P7rQA5WF610FxjWC68ZD-xY9zzBKNgJ98qyBF_iGZD5C2mgJ0rWa/exec";

// const corpoAgenda = document.getElementById('corpo-agenda');
// const seletorData = document.getElementById('data');
// const seletorMaquina = document.getElementById('maquina');
// let reservasGlobais = {};

// // Função para definir a data de hoje no seletor
// function configurarDataAtual() {
//     const hoje = new Date();
//     const ano = hoje.getFullYear();
//     const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
//     const dia = String(hoje.getDate()).padStart(2, '0');
    
//     const dataFormatada = `${ano}-${mes}-${dia}`;
//     document.getElementById('data').value = dataFormatada;
// }

// // Chame a função imediatamente
// configurarDataAtual();

// async function carregarReservas() {
//     corpoAgenda.innerHTML = '<tr><td colspan="3">Carregando horários...</td></tr>';
//     try {
//         const response = await fetch(URL_API);
//         reservasGlobais = await response.json();
//         atualizarAgenda();
//     } catch (e) {
//         corpoAgenda.innerHTML = '<tr><td colspan="3">Erro ao carregar dados.</td></tr>';
//     }
// }

// function atualizarAgenda() {
//     corpoAgenda.innerHTML = '';
//     const dataSelecionada = seletorData.value;
//     const maquinaSelecionada = seletorMaquina.value;

//     for (let hora = 0; hora < 24; hora++) {
//         const horarioFormatado = `${hora}:00 - ${hora + 1}:00`;
//         const chaveReserva = `${dataSelecionada}-M${maquinaSelecionada}-${hora}`;
//         const nomeReserva = reservasGlobais[chaveReserva];

//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//             <td>${horarioFormatado}</td>
//             <td class="${nomeReserva ? 'ocupado' : 'disponivel'}">
//                 ${nomeReserva ? `Reservado por: ${nomeReserva}` : 'Disponível'}
//             </td>
//             <td>
//                 ${nomeReserva 
//                     ? '---' 
//                     : `<input type="checkbox" class="chk-reserva" value="${chaveReserva}">`
//                 }
//             </td>
//         `;
//         corpoAgenda.appendChild(tr);
//     }
// }

// async function reservarSelecionados() {
//     const nome = document.getElementById('nome').value;
//     const email = document.getElementById('email').value;
//     const orientador = document.getElementById('orientador').value;
//     const senhaInformada = document.getElementById('senha-lab').value; // Pegamos a senha do campo
//     const dataTxt = document.getElementById('data').value;
//     const maquinaTxt = seletorMaquina.options[seletorMaquina.selectedIndex].text;

//     if (!senhaInformada) return alert("Digite a senha do laboratório!");
//     if (!nome || !email || !orientador) return alert("Preencha todos os dados!");

//     const selecionados = document.querySelectorAll('.chk-reserva:checked');
//     if (selecionados.length === 0) return alert("Selecione os horários!");

//     const btn = document.getElementById('btn-confirmar');
//     btn.disabled = true;
//     btn.innerText = "Validando e Reservando...";

//     for (let chk of selecionados) {
//         try {
//             const response = await fetch(URL_API, {
//                 method: 'POST',
//                 body: JSON.stringify({ 
//                     action: 'reservar', 
//                     senha: senhaInformada, // Enviamos a senha para o Google validar
//                     chave: chk.value, 
//                     nome: nome,
//                     email: email,
//                     orientador: orientador,
//                     dataAgendamento: dataTxt,
//                     maquina: maquinaTxt
//                 })
//             });

//             const resultado = await response.text();
            
//             if (resultado.includes("Erro: Senha Incorreta")) {
//                 alert("A senha informada está incorreta!");
//                 btn.disabled = false;
//                 btn.innerText = "Confirmar Reservas Selecionadas";
//                 return; // Para o loop imediatamente
//             }
//         } catch (e) {
//             console.error("Erro na reserva");
//         }
//     }

//     alert("Reservas concluídas com sucesso!");
//     document.getElementById('senha-lab').value = "";
//     btn.disabled = false;
//     btn.innerText = "Confirmar Reservas Selecionadas";
//     carregarReservas();
// }

// seletorData.addEventListener('change', atualizarAgenda);
// seletorMaquina.addEventListener('change', atualizarAgenda);
// carregarReservas();