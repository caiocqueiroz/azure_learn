# Plano de Estudos para Entrevista — Azure Platform Engineering

Este plano foi estruturado para uma entrevista técnica/executiva com foco em **Azure platform engineering**, **containers**, **networking enterprise**, **migrations**, **DevOps maturity**, **FinOps**, **database modernization** e **governance**.

A ideia principal não é decorar tecnologias, mas demonstrar:

- profundidade técnica;
- visão arquitetural;
- maturidade de plataforma e governança;
- capacidade de explicar trade-offs;
- comunicação executiva e técnica;
- experiência prática com problemas reais de produção.

## Posicionamento para a entrevista

Posicione-se como um arquiteto/plataforma pragmático:

> “I evaluate trade-offs between speed, governance, operational overhead, cost, security and long-term maintainability. I don’t choose technology in isolation; I choose based on workload requirements and team maturity.”

Evite tentar parecer especialista absoluto em tudo. É melhor soar como alguém que sabe liderar decisões complexas com pragmatismo.

## Estrutura recomendada para respostas

Em português:

```text
Contexto
Problema
Opções avaliadas
Decisão
Trade-offs
Resultado
```

Em inglês:

```text
Situation
Decision
Trade-off
Outcome
```

## Blocos de estudo

| Ordem | Tema | Tempo sugerido |
| --- | --- | --- |
| 1 | [Container Strategy & Azure Container Apps](01-container-strategy-aca.md) | 2h30 |
| 2 | [Azure Networking](02-azure-networking.md) | 2h |
| 3 | [Database Migration](03-database-migration.md) | 2h |
| 4 | [Terraform & Platform Engineering](04-terraform-platform-engineering.md) | 1h30 |
| 5 | [CI/CD + GitOps](05-cicd-gitops.md) | 1h |
| 6 | [FinOps](06-finops.md) | 45 min |
| 7 | [Security & Governance](07-security-governance.md) | 1h |
| 8 | [Executive Communication](08-executive-communication.md) | 45 min |

## Materiais de revisão rápida

- [Perguntas prováveis](09-perguntas-provaveis.md)
- [Frases úteis e prioridade final](10-revisao-final.md)

## Prioridade se o tempo estiver curto

1. ACA vs AKS vs App Service;
2. Private Endpoint vs Service Endpoint;
3. Como expor ACA com App Gateway/APIM;
4. SQL VM → SQL MI vs Azure SQL DB;
5. Blue/green com revisions;
6. GitOps e CI/CD;
7. Managed Identity + Key Vault;
8. FinOps;
9. Terraform enterprise structure;
10. Histórias reais com contexto, decisão, trade-off e resultado.

## Norte final

> “I’m a pragmatic platform/cloud architect who has worked with real production constraints: governance, networking, CI/CD, cost, security, migrations and operational maturity. I don’t try to apply one technology everywhere. I evaluate trade-offs and build platforms that help teams deliver safely.”

