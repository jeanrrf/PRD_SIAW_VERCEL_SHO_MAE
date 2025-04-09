import sys
import os

# Adicionar o diretório raiz ao path para permitir importações relativas
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar a aplicação Flask do backend
from backend.api import app

# Este arquivo serve como entry point para a Vercel
# O handler app é usado pela Vercel para receber e processar as requisições HTTP