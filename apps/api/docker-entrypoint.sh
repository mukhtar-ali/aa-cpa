#!/bin/sh
set -e

prisma migrate deploy

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec node dist/main
