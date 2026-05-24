#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/infra/terraform"
terraform destroy -var-file="${TFVARS_FILE:-terraform.tfvars}"
