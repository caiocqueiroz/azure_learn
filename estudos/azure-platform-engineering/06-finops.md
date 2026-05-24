# Bloco 6 — FinOps

**Tempo sugerido:** 45 min

## O que estudar

- tagging;
- budgets;
- alerts;
- dashboards;
- reserved instances;
- savings plans;
- rightsizing;
- scale-to-zero;
- showback/chargeback;
- cleanup de recursos órfãos.

## Como explicar FinOps

Resposta modelo:

> “FinOps is about creating cost visibility, accountability and optimization without blocking engineering speed. It’s not just cutting cost. It’s making teams understand the cost impact of architecture decisions.”

Frase importante:

> “Cost is an architectural signal.”

## Ações práticas

Tags obrigatórias:

- owner;
- application;
- environment;
- cost-center;
- business-unit.

Outras ações:

- dashboards por time/app;
- budget alerts;
- rightsizing;
- auto-shutdown em dev/test;
- scale-to-zero para workloads event-driven;
- reserved capacity para workloads previsíveis;
- revisão de SKUs superdimensionados.

## Resposta modelo: cost vs reliability

> “I would not optimize cost blindly. First I classify workloads by criticality. For production critical systems, reliability and performance come first, then we optimize using reserved capacity, right-sizing and better architecture. For non-production or bursty workloads, we can be more aggressive with scale-to-zero, auto-shutdown and smaller SKUs. The key is to use data, not guesses.”

