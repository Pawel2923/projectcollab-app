#!/bin/sh
set -e

if [ "$1" = 'frankenphp' ] || [ "$1" = 'php' ] || [ "$1" = 'bin/console' ]; then
	if [ "$(id -u)" = "0" ]; then
		# Dynamically map symfony user UID/GID to match the host user (owner of /app)
		HOST_UID=$(stat -c '%u' /app)
		HOST_GID=$(stat -c '%g' /app)
		usermod -o -u "$HOST_UID" symfony
		groupmod -o -g "$HOST_GID" symfony
		chown -R symfony:symfony /home/symfony

		# Create vendor and var directories if they don't exist and chown to symfony
		mkdir -p vendor var
		chown -R symfony:symfony vendor var
		setfacl -R -m u:www-data:rwX -m u:symfony:rwX var
		setfacl -dR -m u:www-data:rwX -m u:symfony:rwX var

		# Ensure Caddy volume and runtime directories are owned by the updated symfony user
		chown -R symfony:symfony /data /config /var/run/frankenphp
	fi

	if [ -z "$(ls -A 'vendor/' 2>/dev/null)" ]; then
		if [ "$(id -u)" = "0" ]; then
			gosu symfony composer install --prefer-dist --no-progress --no-interaction
		else
			composer install --prefer-dist --no-progress --no-interaction
		fi
	fi

	if grep -q ^DATABASE_URL= .env; then
		echo "Waiting for database to be ready..."
		ATTEMPTS_LEFT_TO_REACH_DATABASE=60
		
		if [ "$(id -u)" = "0" ]; then
			PHP_RUN="gosu symfony php"
		else
			PHP_RUN="php"
		fi

		until [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ] || DATABASE_ERROR=$($PHP_RUN bin/console dbal:run-sql -q "SELECT 1" 2>&1); do
			if [ $? -eq 255 ]; then
				# If the Doctrine command exits with 255, an unrecoverable error occurred
				ATTEMPTS_LEFT_TO_REACH_DATABASE=0
				break
			fi
			sleep 1
			ATTEMPTS_LEFT_TO_REACH_DATABASE=$((ATTEMPTS_LEFT_TO_REACH_DATABASE - 1))
			echo "Still waiting for database to be ready... Or maybe the database is not reachable. $ATTEMPTS_LEFT_TO_REACH_DATABASE attempts left."
		done

		if [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ]; then
			echo "The database is not up or not reachable:"
			echo "$DATABASE_ERROR"
			exit 1
		else
			echo "The database is now ready and reachable"
		fi

		if [ "$( find ./migrations -iname '*.php' -print -quit )" ]; then
			$PHP_RUN bin/console doctrine:migrations:migrate --no-interaction --all-or-nothing
			$PHP_RUN bin/console app:seed-roles
		fi
	fi
fi

if [ "$(id -u)" = "0" ]; then
	exec gosu symfony docker-php-entrypoint "$@"
else
	exec docker-php-entrypoint "$@"
fi
