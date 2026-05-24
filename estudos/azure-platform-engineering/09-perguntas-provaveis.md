# Perguntas prováveis

## 1. Why ACA instead of AKS?

> “I’d choose ACA when the team wants to run containers without taking on the full operational responsibility of Kubernetes. ACA gives us autoscaling, revisions, ingress, Dapr integration and managed operations, which is great for stateless services and event-driven workloads. I’d choose AKS when I need deeper Kubernetes control, custom operators, DaemonSets, complex networking or advanced platform capabilities.”

## 2. When would you not use ACA?

> “I would avoid ACA for workloads that require full Kubernetes extensibility, advanced network policies, custom controllers, DaemonSets, complex service mesh requirements or stateful workloads tightly coupled to Kubernetes primitives. In those cases, AKS gives more control.”

## 3. How would you secure ACA?

> “For internal workloads, I’d use an internal ACA environment with private ingress. Then expose it through App Gateway WAF or API Management depending on whether it is a web or API use case. Dependencies like SQL, Storage, ACR and Key Vault should be accessed through private endpoints where possible. I’d use Managed Identity for authentication, Private DNS for name resolution, and centralized logging for observability.”

## 4. Private Endpoint vs Service Endpoint?

> “Private Endpoint gives the Azure service a private IP inside my VNET, which is stronger isolation and better for enterprise private connectivity. Service Endpoint secures access from a subnet to a public Azure service endpoint, but the service is still reached through its public endpoint. For highly regulated or enterprise scenarios, I usually prefer Private Endpoint.”

## 5. How would you migrate SQL Server from VM to Azure?

> “First I’d assess compatibility, dependencies, database size, downtime tolerance, SQL Agent jobs, linked servers and performance baselines. If compatibility is a major concern, SQL Managed Instance is often a safer first step. If the app is more modern or can be refactored, Azure SQL Database may be better. Then I’d run a test migration, validate data and performance, define cutover and rollback plans, and only then move production.”

## 6. What is GitOps?

> “GitOps means Git is the source of truth for the desired state of infrastructure and applications. Changes go through pull requests, and automation reconciles the actual environment with what is declared in Git. It improves auditability, rollback, governance and consistency.”

## 7. How do you implement blue/green?

> “I run the current and new versions side by side. Traffic stays on the stable version while the new one is deployed and validated. Then traffic is shifted gradually or switched completely. If metrics or health checks fail, rollback is done by routing traffic back to the previous version. In ACA, revisions and traffic splitting are natural mechanisms for this.”

## 8. How do you balance engineering speed and governance?

> “I prefer guardrails over manual gates. Platform teams should provide reusable modules, golden paths, CI/CD templates, security defaults and observability out of the box. That way teams move fast without reinventing security, networking and deployment standards every time.”

## 9. Why Managed Identity?

> “Managed Identity avoids storing credentials in code, config files or pipelines. The workload gets an identity from Azure and uses token-based access to services like Key Vault, Storage or SQL. It improves security, auditability and operational simplicity.”

## 10. How do you approach FinOps?

> “I start with visibility: tagging, dashboards and cost allocation. Then I classify workloads by criticality. For predictable production workloads, reserved capacity or savings plans may help. For non-prod and bursty workloads, scale-to-zero, auto-shutdown and rightsizing are effective. The goal is not just reducing cost, but making cost part of architectural decision-making.”

