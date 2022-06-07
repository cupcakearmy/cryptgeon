#!/bin/sh


HOST=$(echo $MEMCACHE | cut -d: -f1)
PORT=$(echo $MEMCACHE | cut -d: -f2)
echo "Waiting for memcached at $HOST:$PORT"
while ! nc -z -w 1 $HOST $PORT; do   
  sleep 1
  echo "retrying..."
done

echo "Starting server"
/app/cryptgeon
