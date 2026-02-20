from flask import Flask 
from flask_cors import CORS
from database import init_db
from routes import bp as rotas_bp

app = Flask(__name__)
CORS(app) 

app.register_blueprint(rotas_bp)

if __name__ == '__main__':
    init_db()  
    app.run(debug=True)