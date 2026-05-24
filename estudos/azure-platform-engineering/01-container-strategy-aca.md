# Bloco 1 — Container Strategy & Azure Container Apps

**Tempo sugerido:** 2h30

## O que estudar

- Azure Container Apps, ou ACA;
- ACA vs AKS;
- ACA vs App Service;
- revisions;
- blue/green deployment;
- traffic splitting;
- rollback;
- scale-to-zero;
- ingress público e privado;
- Dapr em alto nível;
- Container Apps Environment;
- workload profiles;
- Managed Identity;
- Azure Monitor / Log Analytics.

## Como explicar ACA

Azure Container Apps é uma plataforma **managed/serverless** para rodar containers sem gerenciar diretamente Kubernetes.

Ela entrega capacidades importantes de orquestração de containers:

- autoscaling;
- revisions;
- ingress;
- traffic splitting;
- integração com Dapr;
- execução de APIs, workers e workloads event-driven.

Ao mesmo tempo, abstrai grande parte da complexidade operacional do Kubernetes.

## ACA vs AKS

### Use ACA quando você quer

- menor overhead operacional;
- maior time-to-market;
- workloads stateless;
- APIs;
- background workers;
- event-driven workloads;
- scale-to-zero;
- blue/green ou canary via revisions;
- menos necessidade de customização profunda de Kubernetes.

### Use AKS quando você precisa de

- controle completo de Kubernetes;
- operators;
- DaemonSets;
- custom ingress controllers;
- network policies avançadas;
- service mesh customizado;
- workloads stateful complexos;
- multi-tenancy avançado;
- integração profunda com o ecossistema Kubernetes.

## Frase-chave

> “The main trade-off is control versus operational overhead.”

Isso significa:

- AKS oferece mais controle, mas exige mais responsabilidade operacional;
- ACA oferece menos controle profundo, mas reduz a complexidade de operação.

Outra frase útil:

> “If I don’t need full Kubernetes control, I don’t want to pay the operational cost of full Kubernetes.”

## Resposta modelo: Why ACA instead of AKS?

> “I would choose ACA when the workload needs container orchestration but not full Kubernetes control. The main trade-off is control versus operational overhead. ACA helps teams move faster because it abstracts much of the Kubernetes complexity, while still giving us scaling, revisions, ingress and deployment strategies like blue/green. I would move to AKS when the workload requires advanced Kubernetes features like operators, DaemonSets, custom networking or deeper platform control.”

## Quando não usar ACA

Evite ACA quando o workload exige:

- Kubernetes operators;
- DaemonSets;
- custom controllers;
- service mesh avançado;
- network policies complexas;
- storage drivers específicos;
- workloads stateful muito dependentes de Kubernetes;
- controle detalhado do cluster;
- multi-tenancy avançado.

Resposta modelo:

> “I would avoid ACA if the workload requires deep Kubernetes customization, custom operators, DaemonSets, advanced service mesh, complex ingress controllers, strict pod-level networking controls, or stateful workloads that depend heavily on Kubernetes primitives.”

## Revisions, blue/green e rollback

Em ACA, cada nova versão pode ser publicada como uma **revision**.

Você pode controlar o tráfego entre revisões:

```text
Revision atual: 90%
Nova revision: 10%
```

Depois:

```text
Revision atual: 50%
Nova revision: 50%
```

E finalmente:

```text
Nova revision: 100%
```

Se algo der errado, o rollback pode ser feito redirecionando tráfego para a revision anterior.

Resposta modelo:

> “ACA revisions make progressive delivery easier. I can deploy a new revision without immediately sending 100% of the traffic to it. Then I can use traffic splitting for canary or blue/green strategies and roll back by shifting traffic back to the previous revision if metrics or health checks show issues.”

