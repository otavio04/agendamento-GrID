const SENHA_CORRETA = "LAB123"; // DEFINA SUA SENHA AQUI
const URL_API = "https://script.google.com/macros/s/AKfycbxbLYAFBdVjsyz3P7rQA5WF610FxjWC68ZD-xY9zzBKNgJ98qyBF_iGZD5C2mgJ0rWa/exec";
const corpoAgenda = document.getElementById('corpo-agenda');
const seletorData = document.getElementById('data');
const seletorMaquina = document.getElementById('maquina');

let reservasGlobais = {};

async function carregarReservas() {
    corpoAgenda.innerHTML = '<tr><td colspan="3">Carregando horários...</td></tr>';
    try {
        const response = await fetch(URL_API);
        reservasGlobais = await response.json();
        atualizarAgenda();
    } catch (e) {
        corpoAgenda.innerHTML = '<tr><td colspan="3">Erro ao carregar dados. Verifique a URL da API.</td></tr>';
    }
}

function atualizarAgenda() {
    corpoAgenda.innerHTML = '';
    const dataSelecionada = seletorData.value;
    const maquinaSelecionada = seletorMaquina.value;

    for (let hora = 8; hora < 20; hora++) {
        const horarioFormatado = `${hora}:00 - ${hora + 1}:00`;
        const chaveReserva = `${dataSelecionada}-M${maquinaSelecionada}-${hora}`;
        const nomeReserva = reservasGlobais[chaveReserva];

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${horarioFormatado}</td>
            <td class="${nomeReserva ? 'ocupado' : 'disponivel'}">
                ${nomeReserva ? `Ocupado: ${nomeReserva}` : 'Livre'}
            </td>
            <td>
                ${nomeReserva 
                    ? `<button onclick="acao('cancelar', '${chaveReserva}')">Cancelar</button>` 
                    : `<button onclick="acao('reservar', '${chaveReserva}')">Reservar</button>`
                }
            </td>
        `;
        corpoAgenda.appendChild(tr);
    }
}

async function acao(tipo, chave) {
    const nome = document.getElementById('nome').value;
    const matricula = document.getElementById('email').value;
    const orientador = document.getElementById('orientador').value;
    const senhaInformada = document.getElementById('senha-lab').value;
    const dataSelecionada = seletorData.value;
    const maquinaSelecionada = seletorMaquina.options[seletorMaquina.selectedIndex].text;

    if (senhaInformada !== SENHA_CORRETA) {
        alert("Senha do laboratório incorreta!");
        return;
    }

    if (tipo === 'reservar') {
        if (!nome || !matricula || !orientador) {
            alert("Preencha todos os campos antes de reservar.");
            return;
        }
    }

    if (tipo === 'cancelar' && !confirm("Deseja cancelar?")) return;

    corpoAgenda.style.opacity = "0.5";

    try {
        await fetch(URL_API, {
            method: 'POST',
            body: JSON.stringify({ 
                action: tipo, 
                chave: chave, 
                nome: nome,
                matricula: email,
                orientador: orientador,
                dataAgendamento: dataSelecionada, // Novo dado
                maquina: maquinaSelecionada       // Novo dado
            })
        });

        document.getElementById('senha-lab').value = ""; 
        await carregarReservas();
    } catch (error) {
        alert("Erro na conexão.");
    } finally {
        corpoAgenda.style.opacity = "1";
    }
}

seletorData.addEventListener('change', atualizarAgenda);
seletorMaquina.addEventListener('change', atualizarAgenda);

// Inicia buscando os dados da planilha
carregarReservas();