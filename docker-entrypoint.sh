#!/bin/sh
set -e
export API_UPSTREAM="${API_UPSTREAM:-http://reconciliation-api:8110}"
envsubst '${API_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
