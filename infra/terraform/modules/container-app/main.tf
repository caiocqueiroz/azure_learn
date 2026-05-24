resource "azurerm_container_app" "this" {
  name                         = var.name
  resource_group_name          = var.resource_group_name
  container_app_environment_id = var.container_app_environment_id
  revision_mode                = var.revision_mode

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  registry {
    server   = var.acr_login_server
    identity = var.managed_identity_id
  }

  dynamic "secret" {
    for_each = toset(nonsensitive(keys(var.secrets)))
    content {
      name  = secret.value
      value = var.secrets[secret.value]
    }
  }

  dynamic "dapr" {
    for_each = var.dapr_enabled ? [1] : []
    content {
      app_id   = coalesce(var.dapr_app_id, var.name)
      app_port = var.port
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = var.name
      image  = var.image
      cpu    = var.cpu
      memory = var.memory

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = toset(nonsensitive(keys(var.secrets)))
        content {
          name        = upper(replace(env.value, "-", "_"))
          secret_name = env.value
        }
      }

      dynamic "liveness_probe" {
        for_each = try(var.probes.liveness, null) == null ? [] : [var.probes.liveness]
        content {
          transport               = "HTTP"
          port                    = var.port
          path                    = liveness_probe.value.path
          interval_seconds        = liveness_probe.value.interval_seconds
          timeout                 = liveness_probe.value.timeout_seconds
          initial_delay           = 10
        }
      }

      dynamic "readiness_probe" {
        for_each = try(var.probes.readiness, null) == null ? [] : [var.probes.readiness]
        content {
          transport        = "HTTP"
          port             = var.port
          path             = readiness_probe.value.path
          interval_seconds = readiness_probe.value.interval_seconds
          timeout          = readiness_probe.value.timeout_seconds
        }
      }
    }
  }

  dynamic "ingress" {
    for_each = var.ingress == "disabled" ? [] : [1]
    content {
      external_enabled = var.ingress == "external"
      target_port      = var.port
      transport        = "http"
      traffic_weight {
        percentage      = 100
        latest_revision = true
      }
    }
  }
}
