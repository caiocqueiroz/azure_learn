output "resource_group_name" { value = azurerm_resource_group.rg.name }
output "acr_login_server" { value = azurerm_container_registry.acr.login_server }
output "container_apps_environment_name" { value = azurerm_container_app_environment.env.name }
output "frontend_fqdn" { value = module.container_apps["frontend-web"].fqdn }
output "container_app_names" { value = { for name, app in module.container_apps : name => app.name } }
output "internal_service_urls" { value = local.internal_urls }
