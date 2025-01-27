#!/bin/sh

echo "Creating the schema..."
npx prisma migrate deploy

echo "Starting the application..."
npm run start:prod