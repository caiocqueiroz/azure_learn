# Bloco 3 — Database Migration

**Tempo sugerido:** 2h

Este bloco pode diferenciar candidatos porque exige maturidade de produção.

## O que estudar

- SQL Server em VM para Azure SQL Managed Instance;
- SQL Server em VM para Azure SQL Database;
- Database Migration Service;
- downtime planning;
- cutover;
- rollback;
- replication;
- validação de dados;
- testes de performance;
- compatibilidade.

## SQL VM → SQL Managed Instance

Use SQL Managed Instance quando:

- compatibilidade é prioridade;
- há SQL Agent;
- há cross-database queries;
- há linked servers ou features legadas;
- quer reduzir gestão de VM;
- quer uma modernização gradual.

Trade-off:

- mais compatível;
- mais próximo de SQL Server tradicional;
- geralmente mais caro;
- menos cloud-native que Azure SQL Database.

Resposta modelo:

> “SQL Managed Instance is usually the best landing zone when compatibility is the main risk. It gives us a PaaS operating model while preserving many SQL Server capabilities, which reduces migration friction for legacy workloads.”

## SQL VM → Azure SQL Database

Use Azure SQL Database quando:

- aplicação é mais cloud-native;
- cada database pode operar de forma isolada;
- você quer máximo PaaS;
- há menor dependência de features legadas;
- existe disposição para refatoração.

Trade-off:

- menos overhead operacional;
- potencialmente menor custo;
- menos compatibilidade;
- pode exigir refatoração.

Resposta modelo:

> “Azure SQL Database is a better target when the application is already compatible with a cloud-native database model or when we’re willing to refactor. It reduces operational overhead even more than Managed Instance, but compatibility assessment becomes more important.”

## Como migrar SQL com segurança

Etapas:

1. Assessment de compatibilidade;
2. Levantamento de dependências;
3. Classificação de criticidade;
4. Definição de downtime aceitável;
5. Escolha entre SQL MI e Azure SQL DB;
6. Test migration;
7. Validação de dados;
8. Testes de performance;
9. Plano de cutover;
10. Plano de rollback;
11. Monitoramento pós-migração.

Resposta modelo:

> “I would not start with the migration tool. I’d start with risk classification. Which databases are business critical? What is the acceptable downtime? What features are being used? What is the rollback requirement? Then I’d run an assessment, choose SQL MI or SQL DB, perform a test migration, validate data and performance, and only then schedule production cutover. For critical systems, I’d use an online migration pattern and keep rollback available until the new platform is stable.”

