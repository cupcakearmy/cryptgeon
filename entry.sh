#!/bin/ash

echo "Waiting for memcached"

while ! nc -z -w 1 memcached 11211; do   
  sleep 1
  echo "..."
done

echo "Starting server"
/app/cryptgeon
