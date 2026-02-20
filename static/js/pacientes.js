/* ESTE É O MOTOR DA PÁGINA DE PACIENTES
   Ele gerencia a listagem, a exibição de detalhes e a exclusão.
*/

// 1. O 'DOMContentLoaded' garante que o código só rode após o HTML estar pronto na tela.
let todosOsPacientes = []; // Guarda a lista original do banco

document.addEventListener('DOMContentLoaded', function() {
    listarPacientesCards();

    // Evento de busca: dispara a cada tecla digitada
    const inputBusca = document.getElementById('inputBusca');
    inputBusca.addEventListener('input', function() {
        const termo = inputBusca.value.toUpperCase();
        
        // Filtra por Nome OU CPF
        const filtrados = todosOsPacientes.filter(p => 
            p.nome.includes(termo) || 
            p.CPF.includes(termo)
        );

        renderizarCards(filtrados);
    });
});

async function listarPacientesCards() {
    try {
        const resposta = await fetch('/api/pacientes'); // Use sua rota de API JSON
        todosOsPacientes = await resposta.json();
        renderizarCards(todosOsPacientes);
    } catch (erro) {
        console.error("Erro ao carregar cards:", erro);
    }
}

// Função que APENAS desenha os cards (mantendo seu estilo original)
function renderizarCards(lista) {
    const container = document.getElementById('listaPacientesCards');
    container.innerHTML = ''; 

    if (lista.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted mt-4">Nenhum paciente encontrado.</div>';
        return;
    }

    lista.forEach(p => {
        // Mantendo exatamente o seu layout de card
        const cardHTML = `
            <div class="col-md-4">
                <div class="card card-menu p-3 shadow-sm border-0" 
                     onclick="abrirDetalhes('${p.nome}', '${p.CPF}', '${p.telefone}')"
                     style="cursor: pointer;">
                    <div class="d-flex align-items-center">
                        <div class="fs-2 me-3">👤</div>
                        <div>
                            <h6 class="mb-0 text-primary fw-bold">${p.nome}</h6>
                            <small class="text-muted">CPF: ${p.CPF}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// // --- FUNÇÃO QUE PREENCHE O MODAL E CONFIGURA A EXCLUSÃO ---
// function abrirDetalhes(nome, cpf, telefone) {
//     // A. Preenchemos os dados básicos na janelinha
//     document.getElementById('modalNomePaciente').innerText = nome;
//     document.getElementById('detalheCPF').innerText = cpf;
//     document.getElementById('detalheTelefone').innerText = telefone;

//     // B. CONFIGURAÇÃO DO BOTÃO DE EXCLUIR:
//     // Pegamos o botão de excluir que está lá no footer do modal
//     const botaoExcluir = document.getElementById('btnExcluirPaciente');
    
//     // IMPORTANTE: Toda vez que o modal abre, associamos o CPF atual ao clique do botão
//     botaoExcluir.onclick = function() {
//         deletarPaciente(cpf, nome); 
//     };

//     // C. Mostramos o modal usando o comando do Bootstrap
//     const elementoModal = document.getElementById('modalDetalhes');
//     const meuModal = new bootstrap.Modal(elementoModal);
//     meuModal.show();
// }

// --- ATUALIZAÇÃO DA FUNÇÃO QUE ABRE O MODAL ---
function abrirDetalhes(nome, cpf, telefone) {
    // Preenche os inputs com os dados atuais
    document.getElementById('editNome').value = nome;
    document.getElementById('editCPF').value = cpf;
    document.getElementById('editTelefone').value = telefone;

    // Configura o botão de excluir (já existente)
    document.getElementById('btnExcluirPaciente').onclick = function() {
        deletarPaciente(cpf, nome); 
    };

    const botaoAtualizar = document.getElementById('btnAtualizarPaciente');
    botaoAtualizar.onclick = function() {
        atualizarPaciente(cpf);   
    };

    const meuModal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
    meuModal.show();
}

async function atualizarPaciente(cpfOriginal) {
    const novosDados = {
        nome: document.getElementById('editNome').value.toUpperCase(),
        CPF: document.getElementById('editCPF').value,
        telefone: document.getElementById('editTelefone').value
    };

    try {
        const resposta = await fetch(`/paciente/${cpfOriginal}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novosDados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("✅ " + resultado.mensagem);
            bootstrap.Modal.getInstance(document.getElementById('modalDetalhes')).hide();
            listarPacientesCards(); 
        } else {
            alert("❌ Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro na requisição PUT:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

// --- FUNÇÃO QUE ENVIA O PEDIDO DE EXCLUSÃO PARA O PYTHON ---
async function deletarPaciente(cpf, nome) {
    // Pedimos confirmação para evitar cliques acidentais
    if (confirm(`Tem certeza que deseja excluir ${nome}?`)) {
        try {
            // O fetch envia um método DELETE para a rota do Flask
            const resposta = await fetch(`/paciente/${cpf}`, {
                method: 'DELETE'
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem);
                
                // 1. Fechar o modal automaticamente após apagar
                const modalElemento = document.getElementById('modalDetalhes');
                const modalInstancia = bootstrap.Modal.getInstance(modalElemento);
                if (modalInstancia) {
                    modalInstancia.hide();
                }

                // 2. Atualizar a lista de cards para o paciente sumir da tela
                listarPacientesCards(); 
            } else {
                alert("❌ Erro: " + resultado.mensagem);
            }
        } catch (erro) {
            console.error("Erro na requisição DELETE:", erro);
            alert("Erro ao conectar com o servidor.");
        }
    }
}

// --- FUNÇÃO PARA ABRIR O MODAL DE CADASTRO ---
function abrirModalCadastro() {
    // Limpa o formulário antes de abrir para não mostrar dados antigos
    document.getElementById('formCadastro').reset();
    
    const modalCad = new bootstrap.Modal(document.getElementById('modalCadastro'));
    modalCad.show();
}

// --- FUNÇÃO PARA ENVIAR O POST PARA O SERVIDOR ---
async function salvarNovoPaciente() {
    const nome = document.getElementById('cadNome').value.toUpperCase();
    const cpf = document.getElementById('cadCPF').value;
    const telefone = document.getElementById('cadTelefone').value;

    // Validação simples
    if (!nome || !cpf || !telefone) {
        alert("⚠️ Por favor, preencha todos os campos.");
        return;
    }

    const dados = {
        nome: nome,
        CPF: cpf,
        telefone: telefone
    };

    try {
        // Faz a chamada para a sua rota POST /paciente
        const resposta = await fetch('/paciente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("✅ " + resultado.mensagem);
            
            // Fecha o modal
            const modalElemento = document.getElementById('modalCadastro');
            const instanciaModal = bootstrap.Modal.getInstance(modalElemento);
            instanciaModal.hide();

            // Atualiza a lista de cards automaticamente
            listarPacientesCards(); 
        } else {
            alert("❌ Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}