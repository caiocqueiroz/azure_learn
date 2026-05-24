# TaskFlow Microservices

Ambiente de estudo para Azure Container Apps (ACA) com React, Node.js/Fastify, Docker Compose, Terraform e GitHub Actions.

## Arquitetura

- `frontend-web`: React + Vite + TypeScript. Único Container App com ingress externo público.
- `api-gateway`: Fastify/TypeScript. Ingress interno; expõe `/api/tasks`, `/api/users`, `/api/notifications` e `/health`.
- `task-service`: tarefas em memória, com interface de repositório para evolução futura e eventos por HTTP ou Dapr pub/sub.
- `user-service`: usuários fictícios em memória.
- `notification-service`: últimas notificações em memória, HTTP direto e assinatura Dapr.
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

## Deploy no Azure via GitHub Actions

A criação/alteração de recursos Azure deve acontecer pelos workflows, não por scripts locais. Os scripts mantidos no repositório são apenas para uso local e teste da aplicação.

### Autenticação recomendada

Use OpenID Connect (OIDC) entre GitHub Actions e Azure, sem `AZURE_CREDENTIALS` JSON. Crie uma App Registration/Service Principal com federated credential para este repositório e escopo mínimo necessário na subscription/resource groups usados pelo laboratório.

Configure o environment `azure-dev` no GitHub com aprovação manual para workflows destrutivos/produtivos.

### Variables do repositório/environment

Configure em `Settings > Secrets and variables > Actions`:

| Nome | Tipo | Exemplo |
| --- | --- | --- |
| `AZURE_CLIENT_ID` | variable | Client ID da App Registration OIDC |
| `AZURE_TENANT_ID` | variable | Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | variable | Subscription ID |
| `AZURE_LOCATION` | variable | `eastus` |
| `AZURE_RESOURCE_GROUP` | variable | `rg-taskflow-study` |
| `ACA_ENVIRONMENT_NAME` | variable | `cae-taskflow-study` |
| `ACR_NAME` | variable | `taskflowacrstudy001` |
| `TF_STATE_RESOURCE_GROUP` | variable | `rg-taskflow-tfstate` |
| `TF_STATE_STORAGE_ACCOUNT` | variable | `taskflowtfstate001` |
| `TF_STATE_CONTAINER` | variable | `tfstate` |
| `TF_STATE_KEY` | variable | `taskflow.tfstate` |
| `TASKFLOW_API_KEY` | secret | valor de laboratório para secret do Container App |

### Workflows

- `CI`: valida Node.js, `npm audit --omit=dev`, builds, Docker Compose e Terraform.
- `Bootstrap Terraform State`: cria o Resource Group, Storage Account e container usados pelo backend remoto do Terraform.
- `Terraform Plan`: roda `terraform fmt`, `init`, `validate` e `plan` em pull requests ou manualmente.
- `Terraform Apply and Deploy`: cria recursos base, publica imagens no ACR e aplica o ambiente completo do ACA via Terraform.
- `Deploy Container Apps`: em push para `main` ou manualmente, publica novas imagens e aplica o novo `image_tag` via Terraform.
- `Terraform Destroy`: destrói o ambiente com confirmação explícita `destroy`.

### Ordem recomendada no GitHub Actions

1. Execute `CI` para validar a aplicação.
2. Execute `Bootstrap Terraform State` uma vez por ambiente.
3. Abra PR e valide `Terraform Plan`.
4. Execute `Terraform Apply and Deploy` para criar ACR, Log Analytics, ACA Environment, Managed Identity e Container Apps.
5. Use `Deploy Container Apps` para novas versões da aplicação.
6. Execute `Terraform Destroy` quando terminar o laboratório.

## Infraestrutura Terraform

A configuração está em `infra/terraform` e usa backend remoto `azurerm`. O workflow passa os backend configs pelas variables do GitHub Actions.

Recursos criados:

- Resource Group.
- Azure Container Registry.
- Log Analytics Workspace.
- Azure Container Apps Environment.
- User Assigned Managed Identity com `AcrPull` no ACR.
- Container Apps para os seis serviços.
- Secrets, env vars, health probes, min/max replicas, ingress e Dapr.

O primeiro apply do workflow usa `deploy_container_apps=false` para criar o ACR antes do push das imagens. Depois o workflow publica as imagens e executa o apply completo com `deploy_container_apps=true`.

## Service discovery interno no ACA

Os serviços usam nomes internos do ambiente ACA:

- Frontend → API Gateway: `http://api-gateway`
- API Gateway → Task Service: `http://task-service`
- API Gateway → User Service: `http://user-service`
- API Gateway → Notification Service: `http://notification-service`
- Task Service → Notification Service HTTP: `http://notification-service`

Somente `frontend-web` usa ingress externo. `api-gateway`, `task-service`, `user-service` e `notification-service` usam ingress interno. `worker-service` não tem ingress.

## Operação e validação

Use Terraform e GitHub Actions para mudanças de recursos. Use Azure CLI local apenas para leitura, diagnóstico e validação.

Comandos úteis de leitura:

```bash
az login
az account set --subscription "<subscription-id>"
az containerapp list --resource-group "$AZURE_RESOURCE_GROUP" -o table
az containerapp show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP"
az containerapp ingress show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP"
az containerapp revision list --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" -o table
az containerapp logs show --name worker-service --resource-group "$AZURE_RESOURCE_GROUP" --follow
```

### Ingress

Abra o FQDN público do output `frontend_fqdn`. Os demais serviços não devem ter FQDN público.

### Expor temporariamente o api-gateway para debug

Prefira alterar o Terraform em PR e rodar `Terraform Plan`/`Terraform Apply and Deploy`. Mantenha `external_enabled = false` como padrão e reverta a alteração depois do teste.

### Logs

```bash
az containerapp logs show --name api-gateway --resource-group "$AZURE_RESOURCE_GROUP" --follow
az containerapp logs show --name worker-service --resource-group "$AZURE_RESOURCE_GROUP" --follow
```

### Escala e scale to zero

Altere `container_apps` em `infra/terraform/terraform.tfvars.example` ou nos inputs/variables equivalentes do Terraform e aplique pelo workflow. `min_replicas = 0` permite scale to zero onde fizer sentido.

### Revisions e traffic split

O Terraform usa `revision_mode = "Multiple"`. Para novas revisions, rode `Deploy Container Apps` com novo `image_tag`. Para traffic split, ajuste o bloco `traffic_weight` no módulo Terraform em PR e aplique pelo workflow.

Comandos de leitura:

```bash
az containerapp revision list --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP" -o table
az containerapp ingress show --name frontend-web --resource-group "$AZURE_RESOURCE_GROUP"
```

### Secrets e variáveis de ambiente

Secrets e env vars devem ser alterados via Terraform/GitHub Actions. Use GitHub Actions secrets para valores sensíveis, como `TASKFLOW_API_KEY`, e variables para configurações não sensíveis.

### Dapr service invocation

O Terraform habilita Dapr em `api-gateway`, `task-service`, `user-service` e `notification-service` quando `enable_dapr = true`. Endpoints esperados via sidecar:

```text
http://localhost:3500/v1.0/invoke/task-service/method/tasks
http://localhost:3500/v1.0/invoke/notification-service/method/notifications
```

### Dapr pub/sub

`task-service` publica eventos em `taskflow-pubsub`/`task-events` quando `USE_DAPR_PUBSUB=true`. `notification-service` expõe `/dapr/subscribe` e recebe eventos em `/events/task-events`. Para produção, adicione um componente Dapr pub/sub ao Container Apps Environment, como Azure Service Bus, mantendo os nomes `taskflow-pubsub` e `task-events`.

## Ordem correta de execução

1. Rodar localmente com `./scripts/run-local.sh`.
2. Testar localmente com `./scripts/test-api.sh` e pelo frontend em `http://localhost:3000`.
3. Configurar OIDC, environment `azure-dev`, variables e secrets no GitHub.
4. Rodar `Bootstrap Terraform State`.
5. Validar PR com `CI` e `Terraform Plan`.
6. Rodar `Terraform Apply and Deploy` para criar recursos e publicar imagens.
7. Acessar o frontend pelo FQDN público do output `frontend_fqdn`.
8. Validar comunicação interna criando tarefas pela interface.
9. Validar logs com `az containerapp logs show`.
10. Alterar escala, secrets, env vars, ingress interno/externo e traffic split via Terraform em PR.
11. Rodar `Deploy Container Apps` para nova revision da aplicação.
12. Rodar `Terraform Destroy` com confirmação `destroy` quando terminar.
