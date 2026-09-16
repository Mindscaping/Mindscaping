#!/bin/sh
set -e
mkdir -p /app/data
./node_modules/.bin/prisma db push --skip-generate
exec node node_modules/.bin/next start
