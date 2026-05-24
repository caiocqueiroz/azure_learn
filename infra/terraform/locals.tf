locals {
  default_container = {
    cpu          = 0.25
    memory       = "0.5Gi"
    min_replicas = 0
    max_replicas = 3
  }

  apps = {
    frontend-web         = merge(local.default_container, { port = 8080, ingress = "external", min_replicas = 1, dapr = false }, try(var.container_apps["frontend-web"], {}))
    api-gateway          = merge(local.default_container, { port = 8080, ingress = "internal", min_replicas = 0, dapr = var.enable_dapr }, try(var.container_apps["api-gateway"], {}))
    task-service         = merge(local.default_container, { port = 8080, ingress = "internal", min_replicas = 0, dapr = var.enable_dapr }, try(var.container_apps["task-service"], {}))
    user-service         = merge(local.default_container, { port = 8080, ingress = "internal", min_replicas = 0, dapr = var.enable_dapr }, try(var.container_apps["user-service"], {}))
    notification-service = merge(local.default_container, { port = 8080, ingress = "internal", min_replicas = 0, dapr = var.enable_dapr }, try(var.container_apps["notification-service"], {}))
    worker-service       = merge(local.default_container, { port = 8080, ingress = "disabled", min_replicas = 0, dapr = false }, try(var.container_apps["worker-service"], {}))
  }

  default_images = {
    for name in keys(local.apps) : name => "${azurerm_container_registry.acr.login_server}/taskflow/${name}:${var.image_tag}"
  }

  internal_urls = {
    api_gateway          = "http://api-gateway"
    task_service         = "http://task-service"
    user_service         = "http://user-service"
    notification_service = "http://notification-service"
  }
}
