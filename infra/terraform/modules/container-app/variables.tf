variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "container_app_environment_id" { type = string }
variable "revision_mode" { type = string default = "Multiple" }
variable "image" { type = string }
variable "cpu" { type = number }
variable "memory" { type = string }
variable "port" { type = number }
variable "ingress" { type = string validation { condition = contains(["external", "internal", "disabled"], var.ingress) error_message = "ingress must be external, internal or disabled." } }
variable "env_vars" { type = map(string) default = {} }
variable "secrets" { type = map(string) sensitive = true default = {} }
variable "min_replicas" { type = number default = 0 }
variable "max_replicas" { type = number default = 3 }
variable "acr_login_server" { type = string }
variable "managed_identity_id" { type = string }
variable "dapr_enabled" { type = bool default = false }
variable "dapr_app_id" { type = string default = null }
variable "probes" {
  type = object({
    liveness  = optional(object({ path = string, interval_seconds = number, timeout_seconds = number }))
    readiness = optional(object({ path = string, interval_seconds = number, timeout_seconds = number }))
  })
  default = {}
}
