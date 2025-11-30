#!/bin/bash

# Aumentando o tempo de pausa para 4 segundos para mitigar o "API rate limit exceeded"
PAUSE_TIME=4 

# Variáveis de Configuração
BASE_IP="192.168.0.90"
API_PORT="8000"
CONTENT_TYPE_HEADER="-H \"Content-Type: application/json\""

# Cores para destacar informações
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# IDs de Recurso FIXOS (Usados como fallback)
DYNAMIC_CLIENT_ID="1"
DYNAMIC_CLIENT_ID_TO_DELETE="999"
PAYMENT_TYPE_ID="a8d6d5ab-8931-467c-9f7c-6b2362319c6b" # PIX
PAYMENT_ID_TO_PROCESS="4fb850a9-9b66-4c89-8160-c0f41747175b"
ORDER_ID_GET_PAYMENT="691b79d18eb0dd0dfca68fec"
NOTIFICATION_ORDER_ID="cbb3ed1f-34f8-46b0-ba50-4781a9f0efaf"

# Variáveis GLOBAIS para IDs capturados
NEW_PRODUCT_ID_1="" # Primeiro produto criado (Principal)
NEW_PRODUCT_ID_2="" # Segundo produto criado (Garantia)
NEW_ORDER_ID=""
NEW_PAYMENT_ID=""

# Payloads
CLIENT_PAYLOAD_CREATE='{"id": "'"$DYNAMIC_CLIENT_ID_TO_DELETE"'", "name": "Cliente Temporário", "email": "temp_delete@email.com"}'
CLIENT_PAYLOAD_UPDATE='{"name": "João Silva Atualizado", "email": "joao.updated@email.com"}'
PRODUCT_PAYLOAD_CREATE_1='{"name": "Notebook Dell NOVO (TESTE 1)", "description": "Notebook Dell i7 (Teste 1)", "price": 4000.00, "stock": 5}'
PRODUCT_PAYLOAD_CREATE_2='{"name": "Monitor Samsung (TESTE 2)", "description": "Monitor 27 Polegadas (Teste 2)", "price": 1200.00, "stock": 10}'
PRODUCT_PAYLOAD_UPDATE='{"name": "Produto Atualizado", "price": 4200.00}'
PRODUCT_PAYLOAD_STOCK_UPDATE='{"quantity": -2}'
ORDER_PAYLOAD_STATUS_UPDATE='{ "status": "PAGO" }'
PAYMENT_PAYLOAD_TYPE_CREATE='{ "name": "Cartão de Débito NOVO" }'
PAYMENT_PAYLOAD_PROCESS='{ "value": 7000.00 }'
NOTIFICATION_PAYLOAD_ORDER_PAID='{ "orderId": "'"$NOTIFICATION_ORDER_ID"'", "userId": "'"$DYNAMIC_CLIENT_ID"'", "totalValue": 7000.00}'


# Função para executar o CURL, mostrar o comando e garantir que APENAS o JSON seja capturado.
# MUDANÇA CRUCIAL: Logs detalhados são forçados para o terminal (/dev/tty) para não poluir o stdout.
execute_curl() {
    local method="$1"
    local url_path="$2"
    local headers="$3"
    local data="$4"
    local description="$5"
    local is_modifying="$6"
    
    local url="http://$BASE_IP:$API_PORT/$url_path"
    local CURL_OUTPUT
    local RESPONSE
    local HTTP_STATUS
    
    # Redirecionar logs para /dev/tty para que eles apareçam na tela, mas não sejam capturados pelo $()
    
    echo -e "\n--- $method $description ---" > /dev/tty
    
    local command_exec="curl -s -w \"\n%{http_code}\" -X $method $headers "
    local command_display="curl -s -X $method $headers "
    
    if [[ -n "$data" ]]; then
        command_exec+="-d '$data' "
        command_display+="-d \"$data\" "
    fi
    
    command_exec+="\"$url\""
    command_display+="\"$url\""

    echo -e "${BLUE}COMANDO: ${command_display}${NC}" > /dev/tty
    
    # 2. Executar o CURL e capturar a saída
    CURL_OUTPUT=$(eval "$command_exec")

    HTTP_STATUS=$(echo "$CURL_OUTPUT" | tail -n 1)
    RESPONSE=$(echo "$CURL_OUTPUT" | head -n -1)

    # 3. Imprimir log de resposta no terminal
    echo -e "${YELLOW}STATUS HTTP: $HTTP_STATUS${NC}" > /dev/tty
    echo -e "${GREEN}RESPOSTA:${NC}" > /dev/tty
    
    local FORMATTED_RESPONSE
    FORMATTED_RESPONSE=$(echo "$RESPONSE" | jq .)
    
    if [[ $? -eq 0 && -n "$RESPONSE" ]]; then
        echo "$FORMATTED_RESPONSE" > /dev/tty
    else
        echo -e "${RED}AVISO: Resposta não é JSON válido ou está vazia. Imprimindo resposta bruta:${NC}" > /dev/tty
        echo "$RESPONSE" > /dev/tty
    fi

    if [[ "$is_modifying" -eq 1 ]]; then
        echo -e "Esperando $PAUSE_TIME segundos para análise..." > /dev/tty
        sleep $PAUSE_TIME
    fi
    
    # 4. Retornar o JSON. APENAS o JSON puro vai para o stdout, que é capturado pela variável.
    echo "$RESPONSE"
}

# --- Funções de Requisição ---

## 🧑 Clients
clients_requests() {
    echo -e "\n\n===============================================" > /dev/tty
    echo -e "      🧑 CLIENTS (PORTA $API_PORT) REQUISIÇÕES      " > /dev/tty
    echo -e "===============================================" > /dev/tty
    
    local path_base="api/clients"

    # 1. Create Client (POST)
    execute_curl "POST" "$path_base" "$CONTENT_TYPE_HEADER" "$CLIENT_PAYLOAD_CREATE" "Criar Cliente Temporário (ID: $DYNAMIC_CLIENT_ID_TO_DELETE)" 1 > /dev/null
    
    # 2. Get All Clients (GET)
    execute_curl "GET" "$path_base" "" "" "Listar Todos os Clientes" 0 > /dev/null
    
    # 3. Get Client By ID (GET)
    execute_curl "GET" "$path_base/$DYNAMIC_CLIENT_ID" "" "" "Obter Cliente por ID ($DYNAMIC_CLIENT_ID)" 0 > /dev/null

    # 4. Update Client (PATCH)
    execute_curl "PATCH" "$path_base/$DYNAMIC_CLIENT_ID" "$CONTENT_TYPE_HEADER" "$CLIENT_PAYLOAD_UPDATE" "Atualizar Cliente (ID: $DYNAMIC_CLIENT_ID)" 1 > /dev/null
}

## 📦 Products
products_requests() {
    echo -e "\n\n===============================================" > /dev/tty
    echo -e "      📦 PRODUCTS (PORTA $API_PORT) REQUISIÇÕES      " > /dev/tty
    echo -e "===============================================" > /dev/tty

    local path_base="api/products"
    
    # 1. Create Product (POST) - Tenta criar o produto 1 e capturar ID
    RESPONSE_CREATE_PRODUCT_1=$(execute_curl "POST" "$path_base" "$CONTENT_TYPE_HEADER" "$PRODUCT_PAYLOAD_CREATE_1" "Criar Produto NOVO 1 (Capturar ID)" 1)
    
    NEW_PRODUCT_ID_1=$(echo "$RESPONSE_CREATE_PRODUCT_1" | jq -r '.id' 2>/dev/null)

    # 2. Create Product (POST) - Tenta criar o produto 2 e capturar ID (Garantia/Fallback)
    RESPONSE_CREATE_PRODUCT_2=$(execute_curl "POST" "$path_base" "$CONTENT_TYPE_HEADER" "$PRODUCT_PAYLOAD_CREATE_2" "Criar Produto NOVO 2 (Capturar ID)" 1)
    
    NEW_PRODUCT_ID_2=$(echo "$RESPONSE_CREATE_PRODUCT_2" | jq -r '.id' 2>/dev/null)
    
    # Define qual ID usar para os testes subsequentes
    local TEST_PRODUCT_ID="${NEW_PRODUCT_ID_1:-$NEW_PRODUCT_ID_2}" # Prefere o ID 1, se não, usa o ID 2

    if [[ -z "$TEST_PRODUCT_ID" || "$TEST_PRODUCT_ID" == "null" ]]; then
        echo -e "${RED}ERRO FATAL: Não foi possível capturar nenhum ID de produto. Não será possível testar UPDATE/DELETE.${NC}" > /dev/tty
        return
    fi
    
    echo -e "${YELLOW}ID P/ TESTE DE PRODUTO: $TEST_PRODUCT_ID${NC}" > /dev/tty

    # 3. Get All Products (GET)
    execute_curl "GET" "$path_base" "" "" "Listar Todos os Produtos" 0 > /dev/null
    
    # 4. Get Product By ID (GET) - Usa ID CAPTURADO
    execute_curl "GET" "$path_base/$TEST_PRODUCT_ID" "" "" "Obter Produto por ID ($TEST_PRODUCT_ID)" 0 > /dev/null

    # 5. Update Product (PATCH) - Usa ID CAPTURADO
    execute_curl "PATCH" "$path_base/$TEST_PRODUCT_ID" "$CONTENT_TYPE_HEADER" "$PRODUCT_PAYLOAD_UPDATE" "Atualizar Produto (ID: $TEST_PRODUCT_ID)" 1 > /dev/null

    # 6. Update Product Stock (PATCH) - Usa ID CAPTURADO
    execute_curl "PATCH" "$path_base/$TEST_PRODUCT_ID/stock" "$CONTENT_TYPE_HEADER" "$PRODUCT_PAYLOAD_STOCK_UPDATE" "Atualizar Estoque do Produto (ID: $TEST_PRODUCT_ID)" 1 > /dev/null
}

## 📋 Orders
orders_requests() {
    echo -e "\n\n===============================================" > /dev/tty
    echo -e "      📋 ORDERS (PORTA $API_PORT) REQUISIÇÕES      " > /dev/tty
    echo -e "===============================================" > /dev/tty
    
    local path_base="api/orders"
    # Prioriza o primeiro ID capturado, mas usa o segundo (NEW_PRODUCT_ID_2) como garantia
    local PRODUCT_ID_FOR_ORDER="${NEW_PRODUCT_ID_1:-$NEW_PRODUCT_ID_2}"
    
    if [[ -z "$PRODUCT_ID_FOR_ORDER" || "$PRODUCT_ID_FOR_ORDER" == "null" ]]; then
        echo -e "${RED}ERRO: Não há ID de produto válido para criar o pedido. Pulando testes de Pedido.${NC}" > /dev/tty
        return
    fi
    
    # Cria o payload usando o ID do produto dinâmico
    local ORDER_PAYLOAD_CREATE='{"userId": "'"$DYNAMIC_CLIENT_ID"'", "products": [ { "productId": "'"$PRODUCT_ID_FOR_ORDER"'", "quantity": 1 } ], "paymentMethods": [ { "typeId": "'"$PAYMENT_TYPE_ID"'" } ]}'

    # 1. Create Order (POST) - Tenta criar um novo pedido e capturar ID
    RESPONSE_CREATE_ORDER=$(execute_curl "POST" "$path_base" "$CONTENT_TYPE_HEADER" "$ORDER_PAYLOAD_CREATE" "Criar Pedido NOVO (Usando Prod ID: $PRODUCT_ID_FOR_ORDER)" 1)

    # ⚡️ CAPTURA DINÂMICA DO ID DO PEDIDO ⚡️
    NEW_ORDER_ID=$(echo "$RESPONSE_CREATE_ORDER" | jq -r '.id' 2>/dev/null)
    
    # Define o ID a ser usado, priorizando o dinâmico
    local TEST_ORDER_ID="${NEW_ORDER_ID:-$ORDER_ID_GET_PAYMENT}" 
    
    if [[ -z "$NEW_ORDER_ID" || "$NEW_ORDER_ID" == "null" ]]; then
        echo -e "${RED}AVISO: Não foi possível capturar o ID do novo pedido. Usando ID Fixo (Pode Falhar).${NC}" > /dev/tty
    fi
    
    echo -e "${YELLOW}ID P/ TESTE DE PEDIDO: $TEST_ORDER_ID${NC}" > /dev/tty

    # 2. Get All Orders (GET)
    execute_curl "GET" "$path_base/?userID=$DYNAMIC_CLIENT_ID" "" "" "Listar Todos os Pedidos (Filtrado por userID=$DYNAMIC_CLIENT_ID)" 0 > /dev/null

    # 3. Get Order By ID (GET) - Usa o ID CAPTURADO
    execute_curl "GET" "$path_base/$TEST_ORDER_ID" "" "" "Obter Pedido por ID ($TEST_ORDER_ID)" 0 > /dev/null

    # 4. Update Order Status (PATCH) - Usa o ID CAPTURADO
    execute_curl "PATCH" "$path_base/$TEST_ORDER_ID/status" "$CONTENT_TYPE_HEADER" "$ORDER_PAYLOAD_STATUS_UPDATE" "Atualizar Status do Pedido (ID: $TEST_ORDER_ID)" 1 > /dev/null
}

## 💳 Payments
payments_requests() {
    echo -e "\n\n===============================================" > /dev/tty
    echo -e "      💳 PAYMENTS (PORTA $API_PORT) REQUISIÇÕES      " > /dev/tty
    echo -e "===============================================" > /dev/tty

    local path_type_base="api/type-payments"
    local path_base="api/payments"
    
    # 1. Create Payment Type (POST)
    execute_curl "POST" "$path_type_base" "$CONTENT_TYPE_HEADER" "$PAYMENT_PAYLOAD_TYPE_CREATE" "Criar Tipo de Pagamento NOVO" 1 > /dev/null

    # 2. Get All Payment Types (GET)
    execute_curl "GET" "$path_type_base" "" "" "Listar Todos os Tipos de Pagamento" 0 > /dev/null
    
    # Verifica se o ID do pedido foi capturado na seção de pedidos
    local ORDER_ID_FOR_PAYMENT="${NEW_ORDER_ID:-$ORDER_ID_GET_PAYMENT}" 
    local PAYMENT_PAYLOAD_CREATE_ADJUSTED='{"orderId": "'"$ORDER_ID_FOR_PAYMENT"'", "value": 7000.00, "typePaymentId": "'"$PAYMENT_TYPE_ID"'"}'

    # 3. Create Payment (POST) - Cria um pagamento com ID do pedido dinâmico (ou fallback) e captura o ID do pagamento
    RESPONSE_CREATE_PAYMENT=$(execute_curl "POST" "$path_base" "$CONTENT_TYPE_HEADER" "$PAYMENT_PAYLOAD_CREATE_ADJUSTED" "Criar Pagamento (Para Order ID $ORDER_ID_FOR_PAYMENT)" 1)
    NEW_PAYMENT_ID=$(echo "$RESPONSE_CREATE_PAYMENT" | jq -r '.id' 2>/dev/null)
    
    local TEST_PAYMENT_ID="${NEW_PAYMENT_ID:-$PAYMENT_ID_TO_PROCESS}" # Prioriza o ID recém-criado
    echo -e "${YELLOW}ID P/ TESTE DE PROCESSAMENTO: $TEST_PAYMENT_ID${NC}" > /dev/tty

    # 4. Process Payment (PATCH) - Usa o ID do pagamento recém-criado (ou fixo)
    execute_curl "PATCH" "$path_base/$TEST_PAYMENT_ID/process" "$CONTENT_TYPE_HEADER" "$PAYMENT_PAYLOAD_PROCESS" "Processar Pagamento (ID: $TEST_PAYMENT_ID)" 1 > /dev/null
    
    # 5. Get Payments By Order ID (GET)
    execute_curl "GET" "$path_base/order/$ORDER_ID_GET_PAYMENT" "" "" "Obter Pagamentos por Order ID ($ORDER_ID_GET_PAYMENT)" 0 > /dev/null
}


## 📧 Notifications
notifications_requests() {
    echo -e "\n\n===============================================" > /dev/tty
    echo -e "      📧 NOTIFICATIONS (PORTA $API_PORT) REQUISIÇÃO      " > /dev/tty
    echo -e "===============================================" > /dev/tty
    
    local path_base="api/notifications/order-paid"

    # 1. Notify Order Paid (POST)
    execute_curl "POST" "$path_base" "$CONTENT_TYPE_HEADER" "$NOTIFICATION_PAYLOAD_ORDER_PAID" "Notificar Pedido Pago (Order ID $NOTIFICATION_ORDER_ID)" 1 > /dev/null
}


## 🧹 Limpeza (Executado por último)
cleanup_requests() {
    echo -e "\n\n===============================================" > /dev/tty
    echo -e "${YELLOW}      🧹 LIMPEZA DE RECURSOS (DELETES)      ${NC}" > /dev/tty
    echo -e "===============================================" > /dev/tty
    
    # DELETE Client (ID: 999) - Apenas se ele foi criado no início
    execute_curl "DELETE" "api/clients/$DYNAMIC_CLIENT_ID_TO_DELETE" "" "" "Deletar Cliente Temporário (ID: $DYNAMIC_CLIENT_ID_TO_DELETE)" 1 > /dev/null
    
    # DELETE Product 1 - Tenta deletar o produto recém-criado 1, se houver
    if [[ -n "$NEW_PRODUCT_ID_1" && "$NEW_PRODUCT_ID_1" != "null" ]]; then
        execute_curl "DELETE" "api/products/$NEW_PRODUCT_ID_1" "" "" "Deletar Produto Dinâmico 1 (ID: $NEW_PRODUCT_ID_1)" 1 > /dev/null
    fi
    
    # DELETE Product 2 - Tenta deletar o produto recém-criado 2, se houver
    if [[ -n "$NEW_PRODUCT_ID_2" && "$NEW_PRODUCT_ID_2" != "null" ]]; then
        execute_curl "DELETE" "api/products/$NEW_PRODUCT_ID_2" "" "" "Deletar Produto Dinâmico 2 (ID: $NEW_PRODUCT_ID_2)" 1 > /dev/null
    fi
}


# --- Execução das Funções ---
main() {
    echo "Iniciando requisições CURL para a porta $API_PORT com pausas de $PAUSE_TIME segundos entre operações modificadoras..."
    
    clients_requests
    products_requests
    
    # A ordem é importante: Orders precisa de Products
    orders_requests
    
    # Payments precisa de Orders
    payments_requests
    
    notifications_requests
    
    # Executa as deleções no final
    cleanup_requests
    
    echo -e "\n\n--- 🏁 FIM DAS REQUISIÇÕES ---"
}

# Executa a função principal
main