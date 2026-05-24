variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "environment_name" { type = string }
variable "acr_name" { type = string }
variable "image_tag" {
  type    = string
  default = "latest"
}
variable "deploy_container_apps" {
  type    = bool
  default = true
}
variable "log_analytics_workspace_name" {
  type    = string
  default = "law-taskflow-study"
}
variable "container_apps" {
  description = "Per-service Container Apps sizing, scale and image overrides."
  type = map(object({
    image        = optional(string)
    cpu          = optional(number)
    memory       = optional(string)
    min_replicas = optional(number)
    max_replicas = optional(number)
  }))
  default = {}
}
variable "enable_dapr" {
  type    = bool
  default = true
}
variable "worker_interval_ms" {
  type    = string
  default = "10000"
}
variable "taskflow_api_key" {
  type      = string
  sensitive = true
  default   = "change-me-for-study"
}
variable "tags" {
  type    = map(string)
  default = { app = "taskflow", environment = "study" }
}
