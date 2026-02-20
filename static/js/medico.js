let todosOsMedicos = []; // Guarda a lista original do banco

document.addEventListener('DOMContentLoaded', function() {
    listarMedicosCards();

    // Evento de busca: dispara a cada tecla digitada
    const inputBusca = document.getElementById('inputBuscaMedico');
    inputBusca.addEventListener('input', function() {
        const termo = inputBusca.value.toUpperCase();

        // Filtra por Nome OU CRM
        const filtrados = todosOsMedicos.filter(m => 
            m.nome.includes(termo) || 
            m.CRM.includes(termo)
        );
        renderizarCardsMedicos(filtrados);
    });
});
async function listarMedicosCards() {
    try {
        const resposta = await fetch('/api/medicos'); // Use sua rota de API JSON
        todosOsMedicos = await resposta.json();
        renderizarCardsMedicos(todosOsMedicos);
    } catch (erro) {
        console.error("Erro ao carregar cards:", erro);
    }   
}

// Função que APENAS desenha os cards (mantendo seu estilo original)
function renderizarCardsMedicos(lista) {
    const container = document.getElementById('listaMedicosCards');
    container.innerHTML = '';
    if (lista.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted mt-4">Nenhum médico encontrado.</div>';
        return;
    }

    lista.forEach(m => {
        // Mantendo exatamente o seu layout de card
        const cardHTML = `
            <div class="col-md-4">
                <div class="card card-menu p-3 shadow-sm border-0" 
                     onclick="abrirDetalhesMedico('${m.nome}', '${m.CRM}', '${m.especialidade}')"
                        style="cursor: pointer;">
                    <div class="d-flex align-items-center">
                        <div class="fs-2 me-3">🩺</div>
                        <div>
                            <h6 class="mb-0 text-primary fw-bold">${m.nome}</h6>
                            <small class="text-muted">CRM: ${m.CRM}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function abrirDetalhesMedico(nome, CRM, especialidade) {
    document.getElementById('editNome').value = nome;
    document.getElementById('editCRM').value = CRM;
    document.getElementById('editEspecialidade').value = especialidade;

    document.getElementById('botaoExcluirMedico').onclick = function() {
        excluirMedico(CRM, nome);
    };

    const botaoAtualizar = document.getElementById('botaoAtualizarMedico');
    botaoAtualizar.onclick = function() {
        atualizarMedico(CRM);
    };

    const modal = new bootstrap.Modal(document.getElementById('detalhesMedicoModal'));
    modal.show();
}

async function atualizarMedico(CRM) {
    const novosDados = {
        nome: document.getElementById('editNome').value.toUpperCase(),
        especialidade: document.getElementById('editEspecialidade').value.toUpperCase(),
        CRM: document.getElementById('editCRM').value
    };

    try {
        const resposta = await fetch(`/medico/${CRM}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novosDados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("✅ " + resultado.mensagem);
            bootstrap.Modal.getInstance(document.getElementById('detalhesMedicoModal')).hide();
            listarMedicosCards(); // Recarrega os cards
        } else {
            alert("❌ Erro: " + resultado.erro);
        }
    } catch (erro) {
        console.error("Erro ao atualizar médico:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

async function excluirMedico(CRM, nome) {
    if (confirm(`Tem certeza que deseja excluir o médico ${nome}?`)) {
        try {
            const resposta = await fetch(`/medico/${CRM}`, {
                method: 'DELETE'
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem);
                const modalElemento = document.getElementById('detalhesMedicoModal');
                const modalInstancia = bootstrap.Modal.getInstance(modalElemento);
                if (modalInstancia) {
                    modalInstancia.hide();
                }

                listarMedicosCards();
            } else {
                alert("❌ Erro: " + resultado.erro);
            }
        } catch (erro) {
            console.error("Erro ao excluir médico:", erro);
            alert("Erro ao conectar com o servidor.");
        }   
    }
}

function abrirModalCadastroMedico() {
    document.getElementById('formCadastroMedico').reset();
    const modal = new bootstrap.Modal(document.getElementById('modalCadastroMedico'));
    modal.show();
}

// --- FUNÇÃO QUE ENVIA O PEDIDO DE CADASTRO PARA O PYTHON ---
async function salvarNovoMedico() {
    const novosDados = {
        nome: document.getElementById('cadNome').value.toUpperCase(),
        CRM: document.getElementById('cadCRM').value,
        especialidade: document.getElementById('cadEspecialidade').value.toUpperCase()
    };

    if (!novosDados.nome || !novosDados.CRM || !novosDados.especialidade) {  
        alert("❌ Por favor, preencha todos os campos.");
        return;
    }

    const dados = {
        nome: novosDados.nome,
        CRM: novosDados.CRM,
        especialidade: novosDados.especialidade
    };

    try {
        const resposta = await fetch('/medico', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("✅ " + resultado.mensagem);

            const modalElemento = document.getElementById('modalCadastroMedico');
            const instanciaModal = bootstrap.Modal.getInstance(modalElemento);
            instanciaModal.hide();

            listarMedicosCards();
        } else {
            alert("❌ Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro ao cadastrar médico:", erro);
        alert("Erro ao conectar com o servidor.");  
    }
}