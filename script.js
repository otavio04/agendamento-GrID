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
    const senhaInformada = document.getElementById('senha-lab').value;
    const matricula = document.getElementById('matricula').value;
    const orientador = document.getElementById('orientador').value;

    if (senhaInformada !== SENHA_CORRETA) {
        alert("Senha do laboratório incorreta!");
        return;
    }

    let nome = "";
    if (tipo === 'reservar') {
        nome = prompt("Seu nome completo:");
        if (!nome || !matricula || !orientador) {
            alert("Por favor, preencha Nome, Matrícula e Orientador.");
            return;
        }
    }

    if (tipo === 'cancelar' && !confirm("Deseja realmente cancelar?")) return;

    // Enviamos agora um objeto mais completo para a planilha
    await fetch(URL_API, {
        method: 'POST',
        body: JSON.stringify({ 
            action: tipo, 
            chave: chave, 
            nome: nome,
            matricula: matricula,
            orientador: orientador
        })
    });

    document.getElementById('senha-lab').value = ""; // Limpa a senha por segurança
    carregarReservas();
}

seletorData.addEventListener('change', atualizarAgenda);
seletorMaquina.addEventListener('change', atualizarAgenda);

// Inicia buscando os dados da planilha
carregarReservas();