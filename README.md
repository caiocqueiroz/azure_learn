# TaskFlow Microservices

Ambiente de estudo para Azure Container Apps (ACA) com React, Node.js/Fastify, Docker Compose e Terraform.

## Arquitetura

- `frontend-web`: React + Vite + TypeScript. Único Container App com ingress externo público.
- `api-gateway`: Fastify/TypeScript. Ingress interno; expõe `/api/tasks`, `/api/users`, `/api/notifications` e `/health`.
- `task-service`: CRUD simples de tarefas em memória, com interface de repositório para evolução futura e publicação de eventos por HTTP ou Dapr pub/sub.
- `user-service`: usuários fictícios em memória.
- `notification-service`: últimas notificações em memória, aceita HTTP direto e assinatura Dapr.
- `worker-service`: processamento assíncrono simulado com logs JSON periódicos e sem ingress público.

Todos os containers escutam na porta `8080`.

## Rodar localmente

```bash
cp .env.example .env
./scripts/build-local.sh
./scripts/run-local.sh
```

Acesse:

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Task service: http://localhost:8081
- User service: http://localhost:8082
- Notification service: http://localhost:8083
- Worker health: http://localhost:8084/health

Teste os endpoints principais:

```bash
./scripts/test-api.sh
```

## Build e push das imagens para ACR

Crie/defina o ACR antes de publicar imagens. Exemplo:

```bash
az login
az account set --subscription "<subscription-id>"
export ACR_NAME="taskflowacrstudy001"
export IMAGE_TAG="latest"
az acr login --name "$ACR_NAME"
./scripts/acr-build-push.sh
```

Comandos equivalentes manuais:

```bash
docker build -t "$ACR_NAME.azurecr.io/taskflow/frontend-web:latest" ./frontend-web
docker push "$ACR_NAME.azurecr.io/taskflow/frontend-web:latest"
```

## Provisionar infraestrutura com Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

Ou use os scripts:

```bash
./scripts/terraform-init.sh
./scripts/terraform-plan.sh
./scripts/terraform-apply.sh
```

Para destruir:

```bash
terraform destroy -var-file="terraform.tfvars"
# ou
./scripts/terraform-destroy.sh
```

A infraestrutura cria Resource Group, ACR, Log Analytics Workspace, Container Apps Environment, Managed Identity com `AcrPull`, secrets, env vars, health probes e os seis Container Apps.

## Deploy/atualização dos Container Apps

Depois de publicar novas imagens:

```bash
export AZURE_RESOURCE_GROUP="rg-taskflow-study"
export ACR_NAME="taskflowacrstudy001"
export IMAGE_TAG="latest"
./scripts/deploy-aca.sh
```

Isso executa `az containerapp update` para cada serviço e cria novas revisions quando a imagem/env muda.

## Service discovery interno no ACA

Os serviços usam nomes internos do ambiente ACA:

- Frontend → API Gateway: `http://api-gateway`
- API Gateway → Task Service: `http://task-service`
- API Gateway → User Service: `http://user-service`
- API Gateway → Notification Service: `http://notification-service`
- Task Service → Notification Service HTTP: `http://notification-service`

Somente `frontend-web` usa ingress externo. `api-gateway`, `task-service`, `user-service` e `notification-service` usam ingress interno. `worker-service` não tem ingress.

## Comandos úteis de ACA

```bash
az containerapp list --resource-group "$AZURE_RESOURCE_GROUP" -o table
az containerapp show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP"
az containerapp ingress show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP"
az containerapp revision list --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" -o table
az containerapp logs show --name worker-service --resource-group "$AZURE_RESOURCE_GROUP" --follow
./scripts/show-logs.sh
```

## Como testar recursos do Azure Container Apps

### Ingress

```bash
az containerapp ingress show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP"
az containerapp show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv
```

Abra o FQDN público do `frontend-web` no navegador. Os demais serviços não devem ter FQDN público.

### Expor temporariamente o api-gateway para debug

Use apenas para laboratório e reverta depois:

```bash
az containerapp ingress enable \
  --name api-gateway \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --type external \
  --target-port 8080 \
  --transport http

az containerapp ingress show --name api-gateway --resource-group "$AZURE_RESOURCE_GROUP"

az containerapp ingress enable \
  --name api-gateway \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --type internal \
  --target-port 8080 \
  --transport http
```

### Logs

```bash
az containerapp logs show --name api-gateway --resource-group "$AZURE_RESOURCE_GROUP" --follow
az containerapp logs show --name worker-service --resource-group "$AZURE_RESOURCE_GROUP" --follow
```

### Escala e scale to zero

Ajuste `min_replicas` e `max_replicas` em `infra/terraform/terraform.tfvars` e aplique novamente, ou teste via CLI:

```bash
az containerapp update --name task-service --resource-group "$AZURE_RESOURCE_GROUP" --min-replicas 0 --max-replicas 5
```

### Revisions

```bash
az containerapp revision set-mode --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" --mode multiple
az containerapp update --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" --set-env-vars RELEASE_LABEL=v2
az containerapp revision list --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" -o table
```

### Traffic split

Substitua os nomes das revisions pelos retornados no comando anterior:

```bash
az containerapp ingress traffic set \
  --name frontend-web \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --revision-weight frontend-web--rev1=80 frontend-web--rev2=20
```

### Secrets

```bash
az containerapp secret set \
  --name api-gateway \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --secrets taskflow-api-key="novo-valor-de-estudo"
```

### Variáveis de ambiente

```bash
az containerapp update \
  --name worker-service \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --set-env-vars WORKER_INTERVAL_MS=5000
```

### Dapr service invocation

O Terraform habilita Dapr em `api-gateway`, `task-service`, `user-service` e `notification-service` quando `enable_dapr = true`. Para testar service invocation, execute chamadas de um container com Dapr sidecar para endpoints como:

```bash
http://localhost:3500/v1.0/invoke/task-service/method/tasks
http://localhost:3500/v1.0/invoke/notification-service/method/notifications
```

### Dapr pub/sub

`task-service` publica eventos em `taskflow-pubsub`/`task-events` quando `USE_DAPR_PUBSUB=true`. `notification-service` expõe `/dapr/subscribe` e recebe eventos em `/events/task-events`. Para produção, adicione um componente Dapr pub/sub ao Container Apps Environment (por exemplo Azure Service Bus) e mantenha os mesmos nomes `taskflow-pubsub` e `task-events`.

## Ordem correta de execução

1. Rodar localmente com `./scripts/run-local.sh`.
2. Testar localmente com `./scripts/test-api.sh` e pelo frontend em `http://localhost:3000`.
3. Criar ACR e publicar imagens com `az acr login`, `docker build`, `docker push` ou `./scripts/acr-build-push.sh`.
4. Provisionar a infraestrutura com `terraform init`, `terraform plan` e `terraform apply`.
5. Fazer deploy/atualização dos Container Apps com `./scripts/deploy-aca.sh` quando necessário.
6. Acessar o frontend pelo FQDN público do output `frontend_fqdn`.
7. Validar comunicação interna criando tarefas pela interface.
8. Validar logs com `az containerapp logs show`.
9. Alterar escala com Terraform ou `az containerapp update`.
10. Criar nova revision atualizando imagem ou variável de ambiente.
11. Testar traffic split com `az containerapp ingress traffic set`.
12. Destruir o ambiente com `terraform destroy` quando terminar.
