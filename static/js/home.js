/* ESTE É O FICHEIRO DE LÓGICA DA HOME PAGE
   O objetivo aqui é apenas detetar os cliques nos "Cards" e 
   redirecionar o utilizador para a página correta.
*/

// O evento 'DOMContentLoaded' avisa o navegador para só correr este código
// depois de todo o HTML (os botões, textos, etc) ter sido desenhado na tela.
document.addEventListener('DOMContentLoaded', function() {

    // --- 1. CAPTURAR OS ELEMENTOS ---
    // Usamos o 'document.getElementById' para "pescar" as caixinhas (cards) 
    // que criámos no HTML através do ID único de cada uma.
    const cardPacientes = document.getElementById('btn-pacientes');
    const cardMedicos = document.getElementById('btn-medicos');
    const cardConsultas = document.getElementById('btn-consultas');


    // --- 2. DEFINIR AS AÇÕES (EVENTOS) ---

    // Adicionamos um "escutador" (EventListener) que fica à espera do clique ('click')
    
    // Ação para o Card de Pacientes
    if (cardPacientes) { // Verificamos se o card existe na página para evitar erros
        cardPacientes.addEventListener('click', function() {
            // O 'window.location.href' é o comando que muda o endereço do navegador.
            // Ele vai chamar a rota que criaste no Python (Flask).
            window.location.href = '/pacientes';
        });
    }

    // Ação para o Card de Médicos
    if (cardMedicos) {
        cardMedicos.addEventListener('click', function() {
            window.location.href = '/medicos';
        });
    }

    // Ação para o Card de Consultas
    if (cardConsultas) {
        cardConsultas.addEventListener('click', function() {
            window.location.href = '/consultas';
        });
    }

});

/* DICA: No futuro, quando criares o 'pacientes.js', ele será mais complexo
   porque terá de usar o 'fetch()' para enviar os dados do formulário 
   para o banco de dados. Este da Home é mais simples (navegação).
*/























// // Função para formatar CPF
// function formatarCPF(cpf) {
//     cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
//     cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
//     cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
//     cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
//     return cpf;
// }

// // Função para formatar Telefone
// function formatarTelefone(telefone) {
//     telefone = telefone.replace(/\D/g, ''); // Remove tudo que não é dígito
//     if (telefone.length <= 10) {
//         telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
//         telefone = telefone.replace(/(\d{4})(\d)/, '$1-$2');
//     } else {
//         telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
//         telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
//     }
//     return telefone;
// }

// // Aplicar formatação em tempo real
// document.getElementById('cpf').addEventListener('input', function(e) {
//     e.target.value = formatarCPF(e.target.value);
// });

// document.getElementById('telefone').addEventListener('input', function(e) {
//     e.target.value = formatarTelefone(e.target.value);
// });

// // Função para validar CPF
// function validarCPF(cpf) {
//     cpf = cpf.replace(/\D/g, ''); // Remove pontos e traços
    
//     if (cpf.length !== 11) return false;
    
//     // Verifica se todos os dígitos são iguais
//     if (/^(\d)\1+$/.test(cpf)) return false;
    
//     // Valida primeiro dígito verificador
//     let soma = 0;
//     for (let i = 0; i < 9; i++) {
//         soma += parseInt(cpf.charAt(i)) * (10 - i);
//     }
//     let resto = 11 - (soma % 11);
//     let digitoVerificador1 = resto >= 10 ? 0 : resto;
    
//     if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
    
//     // Valida segundo dígito verificador
//     soma = 0;
//     for (let i = 0; i < 10; i++) {
//         soma += parseInt(cpf.charAt(i)) * (11 - i);
//     }
//     resto = 11 - (soma % 11);
//     let digitoVerificador2 = resto >= 10 ? 0 : resto;
    
//     if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;
    
//     return true;
// }

// // Função para mostrar mensagem
// function mostrarMensagem(texto, tipo) {
//     const mensagemDiv = document.getElementById('mensagem');
//     mensagemDiv.textContent = texto;
//     mensagemDiv.className = 'mensagem ' + tipo;
//     mensagemDiv.style.display = 'block';
    
//     // Esconde a mensagem após 5 segundos
//     setTimeout(() => {
//         mensagemDiv.style.display = 'none';
//     }, 5000);
// }

// // Evento de submissão do formulário
// document.getElementById('formCadastro').addEventListener('submit', function(e) {
//     e.preventDefault(); // Previne o comportamento padrão do formulário
    
//     const nome = document.getElementById('nome').value.trim();
//     const cpf = document.getElementById('cpf').value;
//     const telefone = document.getElementById('telefone').value;
    
//     // Validações
//     if (nome === '') {
//         mostrarMensagem('Por favor, preencha o nome!', 'erro');
//         return;
//     }
    
//     if (!validarCPF(cpf)) {
//         mostrarMensagem('CPF inválido! Verifique o número digitado.', 'erro');
//         return;
//     }
    
//     if (telefone.replace(/\D/g, '').length < 10) {
//         mostrarMensagem('Telefone inválido! Digite um número completo.', 'erro');
//         return;
//     }
    
//     // Prepara os dados para enviar
//     const dadosPaciente = {
//         nome: nome,
//         CPF: cpf.replace(/\D/g, ''), // Remove formatação
//         telefone: telefone.replace(/\D/g, '') // Remove formatação
//     };
    
//     // Envia os dados para o servidor
//     fetch('http://localhost:5000/paciente', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(dadosPaciente)
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Erro na requisição');
//         }
//         return response.json();
//     })
//     .then(data => {
//         mostrarMensagem('✅ ' + data.mensagem, 'sucesso');
//         // Limpa o formulário
//         document.getElementById('formCadastro').reset();
//     })
//     .catch(error => {
//         console.error('Erro:', error);
//         mostrarMensagem('❌ Erro ao cadastrar paciente! Verifique se o servidor está rodando.', 'erro');
//     });
// });















// // document.getElementById('formCadastrarPaciente').addEventListener('submit', function(e) {
// //     e.preventDefault();

// //     const dados = {
// //         nome: document.getElementById('nome').value,
// //         telefone: document.getElementById('telefone').value,
// //         cpf: document.getElementById('cpf').value
// //     };

// //     fetch('http://localhost:5000/paciente', {
// //         method: 'POST',
// //         headers: {
// //             'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify(dados)
// //     })
// //     .then(response => response.json())
// //     .then(data => {
// //         alert(data.mensagem);
// //         if (data.mensagem.includes("sucesso")) {
// //             document.getElementById('formCadastrarPaciente').reset(); // Limpa o form
// //         }
// //     })
// //     .catch(error => {
// //         console.error('Erro:', error);
// //         alert('Erro ao conectar com o servidor.');
// //     });
// // });