from flask import request, jsonify, render_template, Blueprint
from database import get_db_connection
from datetime import datetime
import sqlite3
import re

bp = Blueprint('rotas', __name__)


# Rota principal 
@bp.route('/')
def home():
    return render_template('index.html')

# Rota para renderizar a página de pacientes

@bp.route('/pacientes')
def renderizar_pagina_pacientes():
    return render_template('paciente.html')

# Rota para renderizar a página de médicos
@bp.route('/medicos')
def renderizar_pagina_medicos():
    return render_template('medico.html')

# Rota para renderizar a página de consultas
@bp.route('/consultas')
def renderizar_pagina_consultas():
    return render_template('consulta.html')

#---------PACIENTES--------

# Rota para cadastrar paciente
@bp.route('/paciente', methods=['POST'])
def cadastrar_paciente():
    try:
        dados = request.get_json()
        
        if not dados or 'nome' not in dados or 'CPF' not in dados or 'telefone' not in dados:
            return jsonify({"mensagem": "Dados incompletos!"}), 400
        
        nome = dados['nome'].strip()
        cpf = dados['CPF']
        telefone = dados['telefone']

        if not cpf.isdigit():
            return jsonify({"mensagem": "CPF deve conter apenas números!"}), 400
        
        if not telefone.isdigit():
            return jsonify({"mensagem": "Telefone deve conter apenas números!"}), 400
        
        if not nome or not cpf or not telefone:
            return jsonify({"mensagem": "Todos os campos são obrigatórios!"}), 400
            
        if len(cpf) != 11:
            return jsonify({"mensagem": "CPF inválido! Deve conter 11 números."}), 400
            
        if len(telefone) < 10 or len(telefone) > 11:
            return jsonify({"mensagem": "Telefone inválido! Deve conter DDD + número."}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT CPF FROM paciente WHERE CPF = ?', (cpf,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"mensagem": "CPF já cadastrado no sistema!"}), 409
        
        cursor.execute('''
            INSERT INTO paciente (CPF, nome, telefone)
            VALUES (?, ?, ?)
        ''', (cpf, nome, telefone))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Paciente cadastrado: {nome} - CPF: {cpf}")
        return jsonify({"mensagem": "Paciente cadastrado com sucesso!"}), 201
        
    except sqlite3.IntegrityError:
        return jsonify({"mensagem": "CPF já cadastrado no sistema!"}), 409
    except Exception as e:
        print(f"❌ Erro ao cadastrar paciente: {e}")
        return jsonify({"mensagem": "Erro interno do servidor!"}), 500

# Rota para listar todos os pacientes
@bp.route('/api/pacientes', methods=['GET'])
def listar_pacientes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT CPF, nome, telefone FROM paciente ORDER BY nome')
        pacientes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(pacientes), 200
    except Exception as e:
        print(f"❌ Erro ao listar pacientes: {e}")
        return jsonify({"mensagem": "Erro ao buscar pacientes!"}), 500
    

# Rota para atualizar paciente 
@bp.route('/paciente/<cpf>', methods=['PUT'])
def atualizar_paciente(cpf):
    try:
        dados = request.get_json()

        if not dados or 'nome' not in dados or 'telefone' not in dados or 'CPF' not in dados:
            return jsonify({"mensagem": "Dados incompletos!"}), 400
        
        nome = dados['nome'].strip()
        telefone = dados['telefone']
        novo_cpf = dados['CPF']

        if not novo_cpf.isdigit():
            return jsonify({"mensagem": "CPF deve conter apenas números!"}), 400
        
        if not telefone.isdigit():
            return jsonify({"mensagem": "Telefone deve conter apenas números!"}), 400

        if not nome or not telefone or not novo_cpf:
            return jsonify({"mensagem": "Todos os campos são obrigatórios!"}), 400
        
        if len(novo_cpf) != 11:
            return jsonify({"mensagem": "CPF inválido! Deve conter 11 números."}), 400
            
        if len(telefone) < 10 or len(telefone) > 11:
            return jsonify({"mensagem": "Telefone inválido! Deve conter DDD + número."}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
                       UPDATE paciente
                       SET nome = ?, telefone = ?, cpf = ? WHERE cpf = ?
                       ''', (nome, telefone, novo_cpf, cpf))
        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Paciente atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": "Erro ao atualizar paciente!"}), 500
    
# Rota para deletar paciente 
@bp.route('/paciente/<cpf>', methods=['DELETE'])
def deletar_paciente(cpf):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM paciente WHERE CPF = ?', (cpf,))
        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Paciente deletado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": "Erro ao deletar paciente!"}), 500

#---------MEDICOS--------
    
# Rota para cadastrar medicos
@bp.route('/medico', methods=['POST'])
def cadastrar_medico():
    try:
        dados = request.get_json()
        
        if not dados or 'nome' not in dados or 'CRM' not in dados or 'especialidade' not in dados:
            return jsonify({"mensagem": "Dados incompletos!"}), 400
        
        nome = dados['nome'].strip()
        crm = dados['CRM']
        especialidade = dados['especialidade'].strip()
        
        if not nome or not crm or not especialidade:
            return jsonify({"mensagem": "Todos os campos são obrigatórios!"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT CRM FROM medico WHERE CRM = ?', (crm,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"mensagem": "CRM já cadastrado no sistema!"}), 409
        
        cursor.execute('''
            INSERT INTO medico (CRM, nome, especialidade)
            VALUES (?, ?, ?)
        ''', (crm, nome, especialidade))

        conn.commit()
        conn.close()
        
        print(f"✅ Médico cadastrado: {nome} - CRM: {crm}")
        return jsonify({"mensagem": "Médico cadastrado com sucesso!"}), 201
        
    except sqlite3.IntegrityError:
        return jsonify({"mensagem": "CRM já cadastrado no sistema!"}), 409
    except Exception as e:
        print(f"❌ Erro ao cadastrar médico: {e}")
        return jsonify({"mensagem": "Erro interno do servidor!"}), 500
    
# Rota para listar todos os médicos
@bp.route('/api/medicos', methods=['GET'])
def listar_medicos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
                       SELECT nome, CRM, especialidade FROM medico ORDER BY especialidade
                       ''')
        medicos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(medicos), 200
    except Exception as e:
        print(f"❌ Erro ao listar médicos: {e}")
        return jsonify({"mensagem": "Erro ao buscar médicos!"}), 500    
    
# Rota para atualizar médico 
@bp.route('/medico/<crm>', methods=['PUT'])
def atualizar_medico(crm):
    try:
        dados = request.get_json()

        if not dados or 'nome' not in dados or 'especialidade' not in dados or 'CRM' not in dados:
            return jsonify({"mensagem": "Dados incompletos!"}), 400
        nome = dados['nome'].strip()
        especialidade = dados['especialidade']
        novo_crm = dados['CRM'].strip()

        if not nome or not especialidade or not novo_crm:
            return jsonify({"mensagem": "Todos os campos são obrigatórios!"}), 400
        conn = get_db_connection()
        cursor = conn.cursor()
    
        cursor.execute('''
                       UPDATE medico
                       SET nome = ?, especialidade = ?, CRM = ? WHERE CRM = ?
                       ''', (nome, especialidade, novo_crm, crm))
        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Médico atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": "Erro ao atualizar médico!"}), 500
    
# Rota para deletar médico 
@bp.route('/medico/<crm>', methods=['DELETE'])
def deletar_medico(crm):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM medico WHERE CRM = ?', (crm,))
        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Médico deletado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": "Erro ao deletar médico!"}), 500
    
#---------CONSULTAS--------

# Rota para cadastrar consulta
@bp.route('/consulta', methods=['POST'])
def cadastrar_consulta():
    try:
        dados = request.get_json()
        
        if not dados or 'CPF_paciente' not in dados or 'CRM_medico' not in dados or 'data_hora' not in dados:
            return jsonify({"mensagem": "Dados incompletos!"}), 400
        
        cpf_paciente = dados['CPF_paciente']
        crm_medico = dados['CRM_medico']
        data_hora = dados['data_hora']
        
        if not cpf_paciente or not crm_medico or not data_hora:
            return jsonify({"mensagem": "Todos os campos são obrigatórios!"}), 400
        
        partes = data_hora.split('T')
        data = partes[0] if len(partes) > 0 else ""
        hora = partes[1] if len(partes) > 1 else ""
        
        if not data or not hora:
            return jsonify({"mensagem": "Data e hora inválidas!"}), 400
        
        try:
            data_hora_obj = datetime.strptime(f"{data} {hora}", "%Y-%m-%d %H:%M")
            agora = datetime.now()
            if data_hora_obj < agora:
                return jsonify({"mensagem": "Não é possível marcar uma consulta no passado!"}), 400
        except ValueError:
            return jsonify({"mensagem": "Formato de data/hora inválido!"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT CPF FROM paciente WHERE CPF = ?', (cpf_paciente,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"mensagem": "Paciente não encontrado no sistema!"}), 404
        
        cursor.execute('SELECT CRM FROM medico WHERE CRM = ?', (crm_medico,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"mensagem": "Médico não encontrado no sistema!"}), 404
        
        cursor.execute('''
            SELECT id FROM consulta WHERE medico_CRM = ? AND data = ? AND hora = ?
        ''', (crm_medico, data, hora))
        if cursor.fetchone():
            conn.close()
            return jsonify({"mensagem": "Este médico já possui uma consulta agendada neste horário!"}), 409
        
        cursor.execute('''
            SELECT id FROM consulta WHERE paciente_CPF = ? AND data = ? AND hora = ?
        ''', (cpf_paciente, data, hora))
        if cursor.fetchone():
            conn.close()
            return jsonify({"mensagem": "Este paciente já possui uma consulta agendada neste horário!"}), 409
        
        cursor.execute('''
            INSERT INTO consulta (data, hora, paciente_CPF, medico_CRM)
            VALUES (?, ?, ?, ?)
        ''', (data, hora, cpf_paciente, crm_medico))

        conn.commit()
        conn.close()
        print(f"✅ Consulta cadastrada: Paciente {cpf_paciente} - Médico {crm_medico} - Data: {data} - Hora: {hora}")
        return jsonify({"mensagem": "Consulta cadastrada com sucesso!"}), 201
    except sqlite3.IntegrityError as e:
        print(f"❌ Erro de integridade: {e}")
        return jsonify({"mensagem": "Erro ao agendar consulta. Verifique os dados e tente novamente!"}), 409
    except Exception as e:
        print(f"❌ Erro ao cadastrar consulta: {e}")
        return jsonify({"mensagem": "Erro interno do servidor!"}), 500
    
# Rota para listar todas as consultas
@bp.route('/api/consultas', methods=['GET'])
def listar_consultas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
                       SELECT id, paciente_CPF, medico_CRM, data, hora FROM consulta ORDER BY data, hora
                       ''')
        consultas = []
        for row in cursor.fetchall():
            consulta = dict(row)
            consulta['data_hora'] = f"{row['data']}T{row['hora']}"
            consultas.append(consulta)
        conn.close()
        return jsonify(consultas), 200
    except Exception as e:
        print(f"❌ Erro ao listar consultas: {e}")
        return jsonify({"mensagem": "Erro ao buscar consultas!"}), 500
    
# Rota para deletar consulta 
@bp.route('/consulta/deletar', methods=['DELETE'])
def deletar_consulta():
    try:
        dados = request.get_json()
        
        if not dados or 'paciente_CPF' not in dados or 'medico_CRM' not in dados or 'data' not in dados or 'hora' not in dados:
            return jsonify({"mensagem": "Dados incompletos!"}), 400
        
        paciente_cpf = dados['paciente_CPF']
        medico_crm = dados['medico_CRM']
        data = dados['data']
        hora = dados['hora']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM consulta 
            WHERE paciente_CPF = ? AND medico_CRM = ? AND data = ? AND hora = ?
        ''', (paciente_cpf, medico_crm, data, hora))
        
        conn.commit()
        conn.close()
        
        if cursor.rowcount > 0:
            print(f"✅ Consulta deletada: Paciente {paciente_cpf} - Médico {medico_crm} - Data: {data} - Hora: {hora}")
            return jsonify({"mensagem": "Consulta deletada com sucesso!"}), 200
        else:
            return jsonify({"mensagem": "Consulta não encontrada!"}), 404
    except Exception as e:
        print(f"❌ Erro ao deletar consulta: {e}")
        return jsonify({"mensagem": "Erro ao deletar consulta!"}), 500              

