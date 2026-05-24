#!/usr/bin/env bash
set -euo pipefail
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:?Set AZURE_RESOURCE_GROUP}"
APP_NAME="${APP_NAME:-worker-service}"
az containerapp logs show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --follow
