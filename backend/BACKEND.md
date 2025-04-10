# SENTINNELL Analytics - Documentação do Backend

## Visão Geral

O backend do SENTINNELL Analytics é um sistema construído com Python e Flask, que gerencia dados de produtos da Shopee através de uma API RESTful. O sistema é projetado para ser implantado na Vercel, com um banco de dados SQLite em modo somente leitura para ambiente de produção.

## Arquitetura

### Componentes Principais

1. **API RESTful (Flask)**: Gerencia requisições HTTP e fornece endpoints para o frontend.
2. **Banco de Dados SQLite**: Armazenamento de dados permanente, em modo somente leitura em produção.
3. **ORM SQLAlchemy**: Mapeamento objeto-relacional para interações com o banco de dados.
4. **API Shopee Affiliate**: Integração com a API da Shopee para busca de produtos.

### Estrutura de Diretórios

```
backend/
├── data/                   # Armazenamento do banco de dados SQLite
├── utils/                  # Módulos utilitários
│   ├── database.py         # Funções de interação com banco de dados
│   └── datetime_utils.py   # Utilitários para manipulação de datas
├── api.py                  # API principal do Flask
├── models.py               # Definições de modelos SQLAlchemy
├── migrate.py              # Scripts de migração do banco de dados
├── shopee_affiliate_auth.py # Autenticação e interação com API Shopee
├── CATEGORIA.json          # Definições de categorias
└── BACKEND.md              # Esta documentação
```

## Banco de Dados

### Modelo de Dados

A principal entidade do sistema é o `Product`, que contém informações detalhadas de produtos da Shopee, incluindo:

- Identificadores (ID, Shopee ID)
- Informações básicas (nome, preço, categoria, etc.)
- Informações de afiliado (links, taxas de comissão)
- Metadados e estatísticas (vendas, avaliações)

### Características em Produção (Vercel)

- **Modo Somente Leitura**: Na Vercel, o banco de dados SQLite opera exclusivamente em modo somente leitura, devido às restrições do filesystem serverless.
- **Pré-população de Dados**: O banco de dados deve ser pré-populado durante o processo de build ou importado de um snapshot existente.
- **Cache**: Implementação de mecanismos de cache para reduzir consultas ao banco de dados.

## API Endpoints

### Produtos

- `GET /api/products` - Lista todos os produtos
- `GET /api/products/search` - Busca produtos com filtros
- `GET /api/products/category/{id}` - Lista produtos por categoria

### Categorias

- `GET /api/categories` - Lista todas as categorias disponíveis

### Sistema

- `GET /api/health` - Verifica a saúde do sistema

## Implantação

### Pré-requisitos

- Python 3.9+
- Requirements: Flask, SQLAlchemy, Pydantic, FastAPI
- Banco de dados SQLite pré-populado

### Processo de Implantação na Vercel

1. **Preparação do Banco de Dados**:
   - Execute o script de migração localmente para criar/atualizar o esquema
   - Preencha o banco de dados com dados necessários
   - Inclua o arquivo .db no diretório de implantação

2. **Configuração da Vercel**:
   - Configure o arquivo vercel.json para incluir os arquivos do banco de dados
   - Defina as rotas da API corretamente
   - Certifique-se de que o Python 3.9 está sendo usado

3. **Ambiente de Produção**:
   - Verifique se o código detecta corretamente o ambiente Vercel
   - Confirme que o código está configurado para modo somente leitura no ambiente Vercel

## Limitações e Considerações

1. **Operações de Escrita**: Devido às restrições da Vercel, operações de escrita no banco de dados não funcionam em produção. O sistema deve ser projetado considerando essa limitação.

2. **Tamanho do Banco de Dados**: O banco de dados deve permanecer dentro dos limites de tamanho da Vercel (geralmente alguns MB).

3. **Atualizações de Dados**: Para atualizar dados em produção, é necessário:
   - Fazer atualizações no banco localmente
   - Gerar uma nova build ou implantar novamente com o banco atualizado

## Manutenção e Solução de Problemas

### Logs

- Em produção, os logs podem ser acessados através do dashboard da Vercel
- Localmente, os logs são exibidos no console durante a execução

### Comandos Úteis

```bash
# Rodar migrações do banco de dados
python backend/migrate.py

# Iniciar servidor local
python api/index.py

# Verificar saúde da API
curl http://localhost:5000/api/health
```

### Problemas Comuns

1. **Erro de acesso ao banco de dados**:
   - Verifique se o caminho do banco está correto
   - Em produção, confirme que o arquivo está incluído na implantação

2. **Erro "Database is locked"**:
   - Isto ocorre quando múltiplas solicitações tentam acessar o banco simultaneamente
   - Use proper connection pooling ou mecanismos de retentativa

## Futuras Melhorias

1. **Migração para Banco Serverless**: Considerar migrar para um banco de dados serverless como o Supabase ou Firebase para permitir operações de escrita em produção.

2. **Camada de Cache**: Implementar uma camada de cache mais robusta usando Redis ou similar para reduzir a carga no banco de dados.

3. **API GraphQL**: Considerar a migração para GraphQL para consultas mais eficientes e flexíveis.

---

Documentação atualizada em: Novembro/2023
