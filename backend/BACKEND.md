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
- **Conexões Simultâneas**: Uso de configurações PRAGMA para gerenciar conexões simultâneas e evitar erros de "database locked".
- **Retentativas**: Implementação de mecanismo de retry para operações de banco de dados com falha.

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
   - Inclua o arquivo .db no diretório `data/` para implantação
   - Verifique se o banco de dados não excede 50MB (limite recomendado para Vercel)

2. **Configuração da Vercel**:
   - Use o arquivo `vercel.json` na raiz do projeto com as configurações adequadas
   - Certifique-se que as rotas e build estejam configurados corretamente
   - Configure o ambiente Python 3.9 no `vercel.json`
   - Aumente o timeout das funções se necessário para lidar com consultas longas

3. **Ambiente de Produção**:
   - O sistema detecta automaticamente o ambiente Vercel através da variável `VERCEL_ENV`
   - O SQLite é configurado em modo somente leitura com URI especial
   - Logs são configurados para maximizar a visibilidade na dashboard da Vercel

4. **Otimizações para Serverless**:
   - Conexões de banco de dados são otimizadas para ambiente serverless
   - Configurações PRAGMA adicionadas para melhor gerenciamento de conexões
   - Mecanismo de retry implementado para lidar com erros transientes

### Comando de Implantação

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Login na sua conta Vercel
vercel login

# Implantar em produção
vercel --prod
```

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
   - Em produção, confirme que o arquivo está incluído no diretório `data/`
   - Verifique se os logs mostram o reconhecimento do arquivo de banco

2. **Erro "Database is locked"**:
   - O sistema agora implementa retries automáticos para este tipo de erro
   - Aumente os valores de `PRAGMA busy_timeout` se os erros persistirem
   - Considere aumentar o tempo de duração da função no vercel.json

3. **Erro 504 (Timeout)**:
   - Funções serverless têm limite de execução (10 segundos por padrão)
   - Aumente o `maxDuration` no arquivo vercel.json
   - Otimize consultas pesadas ou adicione paginação

4. **Build falha por dependências**:
   - Certifique-se que `requirements.txt` está atualizado
   - Verifique os logs de build para erros de dependência
   - Use versões específicas das bibliotecas para evitar incompatibilidades

## Futuras Melhorias

1. **Migração para Banco Serverless**: Considerar migrar para um banco de dados serverless como o Supabase ou Firebase para permitir operações de escrita em produção.

2. **Camada de Cache**: Implementar uma camada de cache mais robusta usando Redis ou similar para reduzir a carga no banco de dados.

3. **API GraphQL**: Considerar a migração para GraphQL para consultas mais eficientes e flexíveis.

---

Documentação atualizada em: Janeiro/2024
