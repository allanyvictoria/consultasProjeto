let todasAsConsultas = []; 
let todosPacientesDisponiveis = []; 
let todosMedicosDisponiveis = []; 

document.addEventListener('DOMContentLoaded', function() {
    listarConsultasCards(); // Nome correto ✅
    carregarPacientesEmedicos();

    const inputBusca = document.getElementById('inputBuscaConsulta');
    inputBusca.addEventListener('input', function() {
        const termo = inputBusca.value.toUpperCase().trim();

        const filtrados = todasAsConsultas.filter(p => {
            const pacienteCPF = p.paciente_CPF ? p.paciente_CPF.toUpperCase() : '';
            const medicoCRM = p.medico_CRM ? p.medico_CRM.toUpperCase() : '';

            const cpfMatch = pacienteCPF.includes(termo);
            const crmMatch = medicoCRM.includes(termo);
            
            let dataISO = '';
            if (!p.data_hora) return false;

            if (p.data_hora.includes('T')) {
                const partes = p.data_hora.split('T');
                dataISO = partes[0]; 
            } else {
                dataISO = p.data_hora;
            }
            
            let dataBR = '';
            if (dataISO.includes('-')) {
                const [ano, mes, dia] = dataISO.split('-');
                dataBR = `${dia}/${mes}/${ano}`;
            }
            
            const dataMatchISO = dataISO.includes(termo);
            const dataMatchBR = dataBR.includes(termo);
            
            return cpfMatch || crmMatch || dataMatchISO || dataMatchBR;
        });

        renderizarCards(filtrados);
    });
});

async function carregarPacientesEmedicos() {
    try {
        const resPacientes = await fetch('/api/pacientes');
        todosPacientesDisponiveis = await resPacientes.json();
        
        const resMedicos = await fetch('/api/medicos');
        todosMedicosDisponiveis = await resMedicos.json();
        
        preencherSelectPacientes();
        preencherSelectMedicos();
    } catch (erro) {
        console.error("Erro ao carregar pacientes e médicos:", erro);
    }
}

function preencherSelectPacientes() {
    const select = document.getElementById('agendPaciente');
    select.innerHTML = '<option value="">-- Selecione um paciente --</option>';
    
    todosPacientesDisponiveis.forEach(paciente => {
        const option = document.createElement('option');
        option.value = paciente.CPF;
        option.textContent = `${paciente.nome} (CPF: ${paciente.CPF})`;
        select.appendChild(option);
    });
}

function preencherSelectMedicos() {
    const select = document.getElementById('agendMedico');
    select.innerHTML = '<option value="">-- Selecione um médico --</option>';
    
    todosMedicosDisponiveis.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.CRM;
        option.textContent = `${medico.nome} (${medico.especialidade}) - CRM: ${medico.CRM}`;
        select.appendChild(option);
    });
}

function formatarDataBR(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

async function listarConsultasCards() {
    try {
        const resposta = await fetch('/api/consultas'); 
        todasAsConsultas = await resposta.json();
        renderizarCards(todasAsConsultas);
    } catch (erro) {
        console.error("Erro ao carregar cards:", erro);
    }
}

function renderizarCards(lista) {
    const container = document.getElementById('listaConsultasCards');
    container.innerHTML = '';
    if (lista.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted mt-4">Nenhuma consulta encontrada.</div>';
        return;
    }
    lista.forEach(p => {
        let data = '';
        let hora = '';
        
        if (p.data_hora.includes('T')) {
            const partes = p.data_hora.split('T');
            data = partes[0];
            hora = partes[1];
        } else {
            data = p.data_hora;
        }
        
        const dataFormatada = formatarDataBR(data);
        
        const cardHTML = `  
            <div class="col-md-4">
                <div class="card card-menu p-3 shadow-sm border-0" 
                     onclick="abrirDetalhesConsulta('${p.paciente_CPF}', '${p.medico_CRM}', '${p.data_hora}')"
                        style="cursor: pointer;">   
                    <div class="d-flex align-items-center">
                        <div class="fs-2 me-3">📅</div>
                        <div style="width: 100%;">
                            <h6 class="mb-1 text-primary fw-bold">Paciente CPF: ${p.paciente_CPF}</h6>
                            <small class="text-muted d-block">Médico CRM: ${p.medico_CRM}</small>
                            <small class="text-muted d-block"> ${dataFormatada} | ${hora}</small>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function abrirDetalhesConsulta(paciente_CPF, medico_CRM, data_hora) {
    document.getElementById('editNomePaciente').value = paciente_CPF;
    
    let data = '';
    let hora = '';
    
    if (data_hora.includes('T')) {
        const partes = data_hora.split('T');
        data = partes[0];
        hora = partes[1];
    } else {
        data = data_hora;
    }
    
    document.getElementById('editDataConsulta').value = data;
    document.getElementById('editHoraConsulta').value = hora;
    document.getElementById('editMedicoResponsavel').value = medico_CRM;

    document.getElementById('btnExcluirConsulta').onclick = function() {
        excluirConsulta(paciente_CPF, medico_CRM, data_hora);
    }

    const botaoAtualizar = document.getElementById('btnAtualizarConsulta');
    botaoAtualizar.onclick = function() {
        atualizarConsulta(paciente_CPF, medico_CRM, data_hora);
    }

    const consultaModal = new bootstrap.Modal(document.getElementById('modalDetalhesConsulta'));
    consultaModal.show();
}

function abrirModalAgendamento() {
    document.getElementById('formAgendamento').reset();
    
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataMinima = `${ano}-${mes}-${dia}`;
    
    const inputData = document.getElementById('agendDataConsulta');
    inputData.min = dataMinima;
    
    const modal = new bootstrap.Modal(document.getElementById('modalAgendamento'));
    modal.show();
}

async function salvarAgendamento() {
    const paciente_CPF = document.getElementById('agendPaciente').value;
    const data = document.getElementById('agendDataConsulta').value;
    const hora = document.getElementById('agendHoraConsulta').value;
    const medico_CRM = document.getElementById('agendMedico').value;

    if (!paciente_CPF || !medico_CRM || !data || !hora) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const dataHoraConsulta = new Date(`${data}T${hora}`);
    const agora = new Date();
    
    if (dataHoraConsulta < agora) {
        alert('Não é possível marcar uma consulta no passado. Por favor, escolha uma data e hora futura.');
        return;
    }

    const data_hora = `${data}T${hora}`;

    const novaConsulta = {
        CPF_paciente: paciente_CPF,
        CRM_medico: medico_CRM,
        data_hora: data_hora
    };

    try {
        const resposta = await fetch('/consulta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaConsulta)
        });
        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("✅ " + resultado.mensagem);
            const modalElemento = document.getElementById('modalAgendamento');
            const instanciaModal = bootstrap.Modal.getInstance(modalElemento);
            instanciaModal.hide();
            listarConsultasCards(); // CORRIGIDO AQUI ✅
        } else {
            alert("❌ Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro ao cadastrar consulta:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

async function atualizarConsulta(paciente_CPF, medico_CRM, data_hora) {
    // ⚠️ ATENÇÃO: Essa função vai falhar porque não temos a rota PUT no Python ainda.
    // Se quiser usar, precisamos criar o @bp.route('/consulta/<cpf>', methods=['PUT']) lá no routes.py
    
    const novosDados = {
        CPF_paciente: document.getElementById('editNomePaciente').value,
        CRM_medico: document.getElementById('editMedicoResponsavel').value,
        data_hora: document.getElementById('editDataConsulta').value + 'T' + document.getElementById('editHoraConsulta').value
    };
    try {
        const resposta = await fetch(`/consulta/${paciente_CPF}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novosDados)
        });
        const resultado = await resposta.json();
        if (resposta.ok) {
            alert('Consulta atualizada com sucesso!');
            listarConsultasCards(); // CORRIGIDO AQUI ✅
        } else {
            alert('Erro ao atualizar consulta: ' + resultado.mensagem);
        }   
    } catch (erro) {
        console.error('Erro ao atualizar consulta:', erro);
        alert('Erro ao atualizar consulta.');
    }
}

async function excluirConsulta(paciente_CPF, medico_CRM, data_hora) {
    if (confirm(`Tem certeza que deseja excluir a consulta do paciente CPF ${paciente_CPF} com o médico CRM ${medico_CRM} na data ${data_hora}?`)) {
        try {
            let data = '';
            let hora = '';
            
            if (data_hora.includes('T')) {
                const partes = data_hora.split('T');
                data = partes[0];
                hora = partes[1];
            } else {
                data = data_hora;
            }
            
            const dadosDelete = {
                paciente_CPF: paciente_CPF,
                medico_CRM: medico_CRM,
                data: data,
                hora: hora
            };
            
            const resposta = await fetch(`/consulta/deletar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosDelete)
            });
            const resultado = await resposta.json();
            if (resposta.ok) {
                alert(resultado.mensagem);
                const consultaModalElemento = document.getElementById('modalDetalhesConsulta');
                const consultaModalInstancia = bootstrap.Modal.getInstance(consultaModalElemento);
                if (consultaModalInstancia) {
                    consultaModalInstancia.hide();
                }
                listarConsultasCards(); // CORRIGIDO AQUI ✅
            } else {
                alert('Erro ao excluir consulta: ' + resultado.mensagem);
            }
        } catch (erro) {
            console.error('Erro ao excluir consulta:', erro);
            alert('Erro ao excluir consulta.');
        }
    }
}