#!/bin/sh
set -e

if [ "$(id -u)" = "0" ]; then
	# Dynamically map next user UID/GID to match the host user (owner of /app)
	HOST_UID=$(stat -c '%u' /app)
	HOST_GID=$(stat -c '%g' /app)
	usermod -o -u "$HOST_UID" next
	groupmod -o -g "$HOST_GID" next
	chown -R next:next /home/next

	# Create node_modules if it doesn't exist and chown to next
	mkdir -p node_modules
	chown next:next node_modules
fi

exec "$@"
