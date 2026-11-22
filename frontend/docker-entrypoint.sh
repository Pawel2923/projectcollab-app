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
	chown -R next:next node_modules

	# Ensure spa/dist exists and is owned by next user to prevent Docker root volume issues
	if [ -d /workspace/spa ]; then
		mkdir -p /workspace/spa/dist
		chown -R next:next /workspace/spa/dist
	fi
fi

exec "$@"
