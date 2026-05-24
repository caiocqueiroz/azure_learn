# Bloco 4 — Terraform & Platform Engineering

**Tempo sugerido:** 1h30

## O que estudar

- reusable modules;
- remote state;
- state locking;
- environment separation;
- tfvars;
- PR workflow;
- policy as code;
- drift detection;
- enterprise Terraform structure.

## Ideia central

Terraform em uma plataforma enterprise não é só provisionar infraestrutura.

É criar padrões reutilizáveis para que times consigam entregar com segurança.

Frase importante:

> “Terraform modules are not just code reuse. They are a way to encode platform standards and reduce decision fatigue for application teams.”

## Remote state

No Azure, normalmente o state fica em:

- Azure Storage Account;
- Blob container;
- locking via blob lease.

Resposta:

> “Remote state allows collaboration, locking and consistency across the team. Local state is risky in enterprise environments.”

## Estrutura enterprise possível

```text
envs/
  dev/
  stage/
  prod/
modules/
  container-app/
  networking/
  sql/
  keyvault/
```

Ou:

```text
live/
  dev/
  stage/
  prod/
modules/
```

Cada ambiente pode ter:

- backend próprio;
- tfvars próprio;
- subscription/resource group próprios;
- políticas próprias.

## Drift

Drift acontece quando o ambiente real diverge do código.

Causas comuns:

- mudança manual no portal;
- hotfix emergencial;
- alteração por outro pipeline;
- configuração aplicada fora do Terraform.

Como reduzir:

- RBAC mínimo;
- evitar mudanças manuais;
- PR review;
- `terraform plan` em pipeline;
- policy as code;
- processo para reconciliar mudanças emergenciais.

Resposta modelo:

> “I try to reduce drift by making Terraform the default path for changes, limiting direct portal access, using PR reviews and running plans in CI/CD. But I also recognize emergency changes happen, so the process needs a way to reconcile drift back into code.”

## Resposta modelo: Terraform enterprise

> “I would separate reusable modules from environment composition. Modules would encode company standards, such as tagging, diagnostics, private networking and identity. Environments would consume those modules with specific parameters. I’d use remote state, state locking, PR-based workflows, plan/apply separation and policy checks. The goal is not only provisioning infrastructure, but creating a paved road for teams to deploy safely.”

