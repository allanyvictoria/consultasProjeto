import sqlite3

# Função para conectar ao banco de dados
def get_db_connection():
    conn = sqlite3.connect('banco.db')
    conn.row_factory = sqlite3.Row 
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

# Função para inicializar o banco de dados
def init_db():

    conn = get_db_connection()
    cursor = conn.cursor()

    # tabela de consultas 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS consulta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            hora TEXT NOT NULL,
            paciente_CPF TEXT NOT NULL,
            medico_CRM TEXT NOT NULL,
            FOREIGN KEY (paciente_CPF) REFERENCES paciente(CPF) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (medico_CRM) REFERENCES medico(CRM) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (medico_CRM, data, hora)
        )
    ''')

    # tabela de pacientes 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS paciente (
            CPF TEXT PRIMARY KEY UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            telefone TEXT NOT NULL
        )
    ''')

    # tabela de médicos 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS medico (
            CRM TEXT PRIMARY KEY UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            especialidade TEXT NOT NULL
        )
    ''')    
    
    conn.commit()
    conn.close()