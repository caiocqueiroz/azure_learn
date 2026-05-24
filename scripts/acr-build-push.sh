#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACR_NAME="${ACR_NAME:?Set ACR_NAME}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
az login --only-show-errors >/dev/null || true
az acr login --name "$ACR_NAME"
ACR_LOGIN_SERVER="$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)"
apps=(frontend-web api-gateway task-service user-service notification-service worker-service)
for app in "${apps[@]}"; do
  context="$ROOT_DIR/frontend-web"
  [[ "$app" != "frontend-web" ]] && context="$ROOT_DIR/services/$app"
  docker build -t "$ACR_LOGIN_SERVER/taskflow/$app:$IMAGE_TAG" "$context"
  docker push "$ACR_LOGIN_SERVER/taskflow/$app:$IMAGE_TAG"
done
