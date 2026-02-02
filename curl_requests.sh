#!/bin/bash

BASE="http://localhost"

echo "====== CLIENTS ======"

# Create Client
curl -X POST "$BASE:8000/api/clients" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Gabriel", "email": "gabriel@email.com" }'
echo -e "\n----------------------"

# Get All Clients
curl "$BASE:8000/api/clients"
echo -e "\n----------------------"

# Get Client By ID
curl "$BASE:8000/api/clients/fbe2bacd-f7ff-4994-9a2f-184a49e17b81"
echo -e "\n----------------------"

# Update Client
curl -X PATCH "$BASE:8000/api/clients/fbe2bacd-f7ff-4994-9a2f-184a49e17b81" \
  -H "Content-Type: application/json" \
  -d '{ "name": "João Silva Updated" }'
echo -e "\n----------------------"

# Delete Client
curl -X DELETE "$BASE:8000/api/clients/fbe2bacd-f7ff-4994-9a2f-184a49e17b81"
echo -e "\n----------------------"


echo "====== PRODUCTS ======"

# Create Product
curl -X POST "$BASE:8000/api/products" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Notebook Dell", "description": "Notebook Dell com processador Intel i7", "price": 3500.00, "stock": 10 }'
echo -e "\n----------------------"

# Get All Products
curl "$BASE:8000/api/products"
echo -e "\n----------------------"

# Get Product By ID
curl "$BASE:8000/api/products/54e89934-6793-490d-ba8f-9546efdc6193"
echo -e "\n----------------------"

# Update Product
curl -X PATCH "$BASE:8000/api/products/54e89934-6793-490d-ba8f-9546efdc6193" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Notebook Dell i7", "price": 3800.00 }'
echo -e "\n----------------------"

# Update Product Stock
curl -X PATCH "$BASE:8000/api/products/54e89934-6793-490d-ba8f-9546efdc6193/stock" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": -6 }'
echo -e "\n----------------------"

# Delete Product
curl -X DELETE "$BASE:8000/api/products/1"
echo -e "\n----------------------"


echo "====== ORDERS ======"

# Create Order
curl -X POST "$BASE:8000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{ "userId": "6f59e740-e1e5-43e1-8b34-a053d53775f3", "products": [{ "productId": "7b2481c0-5993-4919-87ec-3bf02a854545", "quantity": 1 }], "paymentMethods": [{ "typeId": "4a068dd0-af28-4b0b-977b-61c9e25fcace" }] }'
echo -e "\n----------------------"

# Get All Orders
curl "$BASE:8000/api/orders"
echo -e "\n----------------------"

# Get Order By ID
curl "$BASE:8000/api/orders/691a1e0eb3e5301481420880"
echo -e "\n----------------------"

# Update Order Status
curl -X PATCH "$BASE:8000/api/orders/691a1e0eb3e5301481420880/status" \
  -H "Content-Type: application/json" \
  -d '{ "status": "PAGO" }'
echo -e "\n----------------------"


echo "====== PAYMENTS ======"

# Create Payment Type
curl -X POST "$BASE:8000/api/type-payments" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Cartão de Crédito" }'
echo -e "\n----------------------"

# Get All Payment Types
curl "$BASE:8000/api/type-payments"
echo -e "\n----------------------"

# Create Payment
curl -X POST "$BASE:8000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "691a1e0eb3e5301481420880", "value": 3500.00, "typePaymentId": "4a068dd0-af28-4b0b-977b-61c9e25fcace" }'
echo -e "\n----------------------"

# Process Payment
curl -X PATCH "$BASE:8000/api/payments/4b66d6fd-827e-41a1-965f-e5fbd2c63d14/process" \
  -H "Content-Type: application/json" \
  -d '{ "value": 3800.00 }'
echo -e "\n----------------------"

# Get Payments By Order ID
curl "$BASE:8000/api/payments/order/691a22ecdf0afa86050a51d6"
echo -e "\n----------------------"


echo "====== NOTIFICATIONS ======"

# Notify Order Paid
curl -X POST "$BASE:3005/api/notifications/order-paid" \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "507f1f77bcf86cd799439011", "userId": "1", "totalValue": 7000.00 }'
echo -e "\n----------------------"

echo "Todas as requisições foram executadas."
