# Backend e-commerce

Este projeto contém uma arquitetura de microserviços para **usuários, produtos, pedidos e pagamentos**, orquestrados via **Docker Compose**.

---

## 📂 Estrutura do Projeto

```
order-service/       # Serviço de pedidos
payment-service/     # Serviço de pagamentos
product-service/     # Serviço de produtos
user-service/        # Serviço de usuários
docker-compose.yml   # Orquestração dos serviços e bancos de dados
start_DBs.sh         # Script auxiliar para subir os bancos
README.md            # Documentação do projeto
```

---

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

---

## ▶️ Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   cd SEU_REPOSITORIO
   ```

2. Suba os containers com o Docker Compose:
   ```bash
   ./start.sh
   ```
   > Este script executa o docker-compose.yml, inicializa os bancos de dados necessários e executa as migrações para cada serviço.
   
3. Inicie os serviços:
   ```bash
   cd user-service && npm start
   cd product-service && npm start
   cd order-service && npm start
   cd payment-service && npm start
   ```

---

## 🌐 Endpoints (exemplos)

- **User Service** → `http://localhost:3001`
- **Product Service** → `http://localhost:3002`
- **Order Service** → `http://localhost:3003`
- **Payment Service** → `http://localhost:3004`

---

## 🛠️ Tecnologias Utilizadas

- Node.js / Express (exemplo)
- PostgreSQL
- Docker & Docker Compose
- Scripts de migração com Prisma

---

## 📌 Observações

- Certifique-se de que as portas definidas em cada serviço não estejam em uso.
- Configure variáveis de ambiente em cada serviço (ex.: `.env`) conforme necessário.
