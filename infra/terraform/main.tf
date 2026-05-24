resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = false
  tags                = var.tags
}

resource "azurerm_log_analytics_workspace" "law" {
  name                = var.log_analytics_workspace_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

resource "azurerm_container_app_environment" "env" {
  name                       = var.environment_name
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.law.id
  tags                       = var.tags
}

resource "azurerm_user_assigned_identity" "aca_pull" {
  name                = "id-taskflow-aca-pull"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.aca_pull.principal_id
}

module "container_apps" {
  source   = "./modules/container-app"
  for_each = var.deploy_container_apps ? local.apps : {}

  name                         = each.key
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Multiple"
  image                        = coalesce(try(each.value.image, null), local.default_images[each.key])
  cpu                          = each.value.cpu
  memory                       = each.value.memory
  port                         = each.value.port
  ingress                      = each.value.ingress
  min_replicas                 = each.value.min_replicas
  max_replicas                 = each.value.max_replicas
  acr_login_server             = azurerm_container_registry.acr.login_server
  managed_identity_id          = azurerm_user_assigned_identity.aca_pull.id
  dapr_enabled                 = each.value.dapr
  dapr_app_id                  = each.key
  env_vars = merge(
    {
      PORT = "8080"
      TASKFLOW_API_KEY_SECRET_NAME = "taskflow-api-key"
    },
    each.key == "frontend-web" ? { API_GATEWAY_URL = local.internal_urls.api_gateway } : {},
    each.key == "api-gateway" ? { TASK_SERVICE_URL = local.internal_urls.task_service, USER_SERVICE_URL = local.internal_urls.user_service, NOTIFICATION_SERVICE_URL = local.internal_urls.notification_service } : {},
    each.key == "task-service" ? { NOTIFICATION_SERVICE_URL = local.internal_urls.notification_service, USE_DAPR_PUBSUB = tostring(var.enable_dapr), DAPR_PUBSUB_NAME = "taskflow-pubsub", DAPR_TOPIC_NAME = "task-events" } : {},
    each.key == "notification-service" ? { DAPR_PUBSUB_NAME = "taskflow-pubsub", DAPR_TOPIC_NAME = "task-events", MAX_NOTIFICATIONS = "50" } : {},
    each.key == "worker-service" ? { WORKER_INTERVAL_MS = var.worker_interval_ms, WORKER_NAME = "taskflow-worker" } : {}
  )
  secrets = {
    taskflow-api-key = var.taskflow_api_key
  }
  probes = {
    liveness = { path = "/health", interval_seconds = 30, timeout_seconds = 5 }
    readiness = { path = "/health", interval_seconds = 10, timeout_seconds = 3 }
  }

  depends_on = [azurerm_role_assignment.acr_pull]
}
