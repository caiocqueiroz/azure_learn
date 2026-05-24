#!/usr/bin/env bash
set -euo pipefail
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:?Set AZURE_RESOURCE_GROUP}"
ACR_NAME="${ACR_NAME:?Set ACR_NAME}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ACR_LOGIN_SERVER="$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)"
apps=(frontend-web api-gateway task-service user-service notification-service worker-service)
for app in "${apps[@]}"; do
  az containerapp update --name "$app" --resource-group "$RESOURCE_GROUP" --image "$ACR_LOGIN_SERVER/taskflow/$app:$IMAGE_TAG"
done
