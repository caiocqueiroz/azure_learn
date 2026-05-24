# Bloco 5 — CI/CD + GitOps

**Tempo sugerido:** 1h

## O que estudar

- Azure DevOps pipelines;
- GitHub Actions;
- GitOps;
- image promotion;
- blue/green;
- rollback;
- immutable artifacts;
- CI vs CD;
- deployment approvals;
- security scanning.

## O que é GitOps

Resposta curta:

> “GitOps is an operating model where Git is the source of truth for the desired state of the system. Changes are made through pull requests, and an agent or pipeline reconciles the actual environment with what is declared in Git.”

Resposta com valor executivo:

> “Instead of manually changing production, we change declarative configuration in Git. This gives us auditability, review, rollback, traceability and better governance.”

## CI vs CD

### CI

- build;
- test;
- lint;
- security scan;
- container image;
- artifact.

### CD

- deploy;
- promote;
- run migrations;
- smoke tests;
- rollback;
- observability checks.

## Image promotion

Modelo maduro:

```text
commit
  |
CI builds image
  |
image tagged with SHA
  |
scan image
  |
deploy to dev
  |
promote same image to staging
  |
approval
  |
promote same image to prod
```

Frase importante:

> “The artifact should be immutable. We should promote the same tested image across environments instead of rebuilding for each environment.”

## Blue/green deployment

Blue/green significa rodar duas versões lado a lado:

- blue: versão atual em produção;
- green: nova versão.

Depois da validação, o tráfego é movido para green.

Se algo falhar, o rollback é mover tráfego de volta para blue.

### Em ACA

- revisions;
- traffic splitting.

### Em AKS

- services/ingress;
- Argo Rollouts;
- Flagger;
- service mesh.

### Em App Service

- deployment slots.

## CI/CD para ACA

Resposta modelo:

> “I’d build the container image in the CI pipeline, run tests and security scans, push the image to ACR, and deploy using IaC or a controlled deployment pipeline. For production, I’d use revision-based rollout with traffic splitting, health checks and observability gates. Secrets should not be in the pipeline; the app should use Managed Identity to access Key Vault. I’d also keep image tags immutable, usually based on commit SHA, and promote the same artifact across environments.”

