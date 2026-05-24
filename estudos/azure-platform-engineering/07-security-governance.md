# Bloco 7 — Security & Governance

**Tempo sugerido:** 1h

## O que estudar

- Managed Identity;
- RBAC;
- Key Vault;
- Defender for Cloud;
- Defender for Containers;
- Azure Policy;
- least privilege;
- private networking;
- secretless architecture;
- governance guardrails.

## Managed Identity vs secrets

Resposta modelo:

> “Managed Identity reduces secret management risk. Instead of storing credentials in code, pipelines or configuration files, Azure issues tokens to the workload identity. Access can be controlled through RBAC, audited centrally and revoked without rotating application secrets. It supports least privilege and is much safer operationally.”

Benefícios:

- menos secrets;
- menos rotação manual;
- menos risco de vazamento;
- integração com Entra ID;
- RBAC;
- auditoria centralizada.

## Key Vault

Use Key Vault para:

- secrets;
- certificates;
- keys.

Boas práticas:

- acesso via Managed Identity;
- Private Endpoint;
- firewall habilitado;
- RBAC;
- logging;
- soft delete;
- purge protection.

Resposta modelo:

> “Key Vault should not become just another public secret store. In enterprise environments, I’d use private endpoints, restricted access, RBAC, logging, purge protection and Managed Identity from workloads.”

## Defender for Cloud / Containers

Resposta em alto nível:

> “Defender for Cloud helps with cloud security posture management and workload protection. For containers, it can identify image vulnerabilities, risky configurations, runtime threats and compliance issues.”

## Governança

Governança inclui:

- Azure Policy;
- naming standards;
- tagging;
- landing zones;
- management groups;
- subscriptions por domínio/time/ambiente;
- RBAC;
- private networking;
- logging obrigatório;
- CI/CD com aprovação;
- IaC obrigatório.

Frase importante:

> “Good governance should create guardrails, not gates. The goal is to let teams move fast inside safe boundaries.”

