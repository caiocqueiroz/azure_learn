# Bloco 2 — Azure Networking

**Tempo sugerido:** 2h

Este provavelmente será um dos blocos mais importantes.

## O que estudar

- VNET;
- subnets;
- Private Endpoints;
- Service Endpoints;
- VNET Integration;
- Hub-and-spoke;
- Private DNS Zones;
- split-horizon DNS;
- Application Gateway;
- WAF;
- API Management;
- multi-subscription landing zones.

## Private Endpoint vs Service Endpoint

### Private Endpoint

Private Endpoint cria uma interface de rede privada dentro da VNET para acessar um serviço Azure.

Exemplos:

- Azure SQL;
- Storage Account;
- Key Vault;
- Azure Container Registry.

Características:

- usa IP privado;
- reduz exposição pública;
- usa Azure backbone;
- integra com Private DNS Zones;
- é mais adequado para ambientes enterprise.

Resposta curta:

> “Private Endpoint gives the service a private IP inside my VNET, so consumers access it privately without relying on the public endpoint.”

### Service Endpoint

Service Endpoint estende a identidade da VNET/subnet para um serviço Azure, mas o serviço ainda usa endpoint público.

Características:

- mais simples;
- menos isolamento;
- endpoint do serviço continua público;
- pode funcionar em cenários menos restritivos.

Resposta curta:

> “Service Endpoint secures access from a subnet to an Azure service, but the service still uses its public endpoint. Private Endpoint is usually preferred when stronger private connectivity is required.”

## Como expor ACA de forma segura

Resposta modelo:

> “For internal applications, I would use an internal Container Apps Environment with private ingress. Then I’d expose it through Application Gateway with WAF or through API Management depending on the use case. DNS would be handled with Private DNS Zones, and access would be controlled through network rules, identity, TLS and RBAC. For public APIs, I’d still prefer a controlled edge layer like APIM or App Gateway WAF instead of exposing every app directly.”

Arquitetura possível:

```text
Internet / Corporate Network
        |
   App Gateway WAF
        |
 Private ingress
        |
Azure Container Apps Environment
        |
Private Endpoints:
- Key Vault
- Azure SQL
- Storage
- ACR
```

Ou para APIs:

```text
Consumers
   |
APIM
   |
Internal ACA
   |
Backend services via Private Endpoints
```

## Hub-and-spoke

Modelo onde serviços compartilhados ficam no hub e workloads ficam nos spokes.

No hub:

- Azure Firewall;
- VPN Gateway;
- ExpressRoute;
- Private DNS Resolver;
- Bastion;
- monitoramento centralizado.

Nos spokes:

- aplicações;
- ACA;
- AKS;
- App Service;
- bancos;
- private endpoints.

Resposta modelo:

> “In a hub-and-spoke model, shared services like firewall, DNS, VPN/ExpressRoute, Bastion and monitoring live in the hub, while application workloads run in separate spokes. This reduces blast radius, centralizes governance and allows teams to manage workloads independently while still following enterprise network controls.”

## Split-horizon DNS

Split-horizon DNS significa que o mesmo hostname pode resolver para endereços diferentes dependendo da origem da requisição.

Exemplo:

```text
mydb.database.windows.net

Dentro da VNET  -> 10.10.2.5
Fora da VNET    -> endpoint público ou bloqueado
```

Resposta modelo:

> “Split-horizon DNS means the same hostname can resolve differently depending on where the request comes from. Internally it resolves to a private IP, externally it may resolve to a public IP or not resolve at all. This is common when using Private Endpoints and Private DNS Zones.”

