# E-Commerce Microservices — README

Este repositório contém um conjunto de microserviços para um e-commerce (Clientes, Produtos, Pedidos, Pagamentos e Notificações) preparados para rodar via Docker Compose ou localmente para desenvolvimento.

## Serviços e portas (padrão do docker-compose)
- `cliente-service` — `http://localhost:3001` (Clientes)
- `produto-service` — `http://localhost:3002` (Produtos)
- `pedidos-service` — `http://localhost:3003` (Pedidos)
- `pagamentos-service` — `http://localhost:3004` (Pagamentos)
- `notificacoes-service` — `http://localhost:3005` (Notificações)
- RabbitMQ Management UI: `http://localhost:15672` (usuário: `user` / senha: `password`)

## Requisitos
- Docker 20+ e Docker Compose
- Node.js 18+ (se for rodar serviços localmente)
- npm

## Variáveis de ambiente importantes
- `RABBITMQ_URL` — URL de conexão com RabbitMQ (ex.: `amqp://user:password@rabbitmq:5672`)
- `DATABASE_URL` — URL do banco (cada serviço que usa Prisma define a sua própria variável no `docker-compose`)
- Arquivo de exemplo de variáveis: `.env` (já presente para `pedidos` MongoDB nesse projeto)

## Rodando com Docker Compose (recomendado)
Este repositório já contém um `docker-compose.yml` configurado com bancos, serviços e RabbitMQ.

1. Construir e subir tudo:

```bash
docker-compose up --build -d
```

2. Verificar logs:

```bash
docker-compose logs -f pagamentos-service
docker-compose logs -f notificacoes-service
docker-compose logs -f rabbitmq
```

3. Parar e remover:

```bash
docker-compose down
```

Observações:
- O `docker-compose.yml` já executa as migrations e seeds (quando aplicável) nas definições `command` de cada serviço.
- RabbitMQ já está configurado no compose com usuário `user` e senha `password`.

## RabbitMQ — como funciona aqui
- Exchange: `orders` (type `topic`)
- Routing key usada para pagamento: `order.paid`
- Queue criada para notificações: `notification.order-paid` (binding `orders` -> `notification.order-paid` com `order.paid`)
- `pagamentos-service` publica eventos quando um pagamento é aprovado (evento contém `orderId`, `clientName`, `timestamp`).
- `notificacoes-service` consome e apenas simula envio imprimindo no console:

```
📧 NOTIFICAÇÃO ENVIADA:
{clientName}, seu pedido foi PAGO com sucesso e será despachado em breve.
```

## Testes e uso manual (Insomnia / Postman)
Há um arquivo pronto para importar no Insomnia: `insomnia_collection.json` na raiz do repositório. Ele contém todas as requisições para os endpoints de cada serviço.

Fluxo de teste recomendado (End-to-End):
1. Criar cliente (`POST /api/clients` no serviço `cliente-service`)
2. Criar produtos (`POST /api/products` no `produto-service`)
3. Criar pedido (`POST /api/orders` no `pedidos-service`)
4. Criar tipo de pagamento (`POST /api/type-payments` no `pagamentos-service`)
5. Criar pagamento (`POST /api/payments` no `pagamentos-service`) — referenciando `orderId`
6. Processar pagamento (`PATCH /api/payments/:id/process`) — quando aprovado, publica evento no RabbitMQ e o `notificacoes-service` exibirá a mensagem nos logs
