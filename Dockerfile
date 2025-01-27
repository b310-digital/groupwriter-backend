FROM node:22-alpine3.19 AS base

USER node

ENV APP_PATH=/home/node/app

RUN mkdir -p $APP_PATH
WORKDIR $APP_PATH

# Production build step for the application. We need to omit NODE_ENV=production here, because tsc is a development dependency
FROM base AS production_builder

COPY --chown=node:node package.json package-lock.json tsconfig.json tsconfig.prod.json entrypoint.prod.sh  $APP_PATH/

USER node

RUN npm ci

COPY --chown=node:node src/ $APP_PATH/src/
COPY --chown=node:node prisma/ ./prisma/
# needed for prisma to generate the types
RUN npx prisma generate

RUN npm run build:prod

# Production Container
FROM base AS production
# Set NODE_ENV, so that npm ci omits dev dependencies
ENV NODE_ENV=production
WORKDIR $APP_PATH

COPY --chown=node:node entrypoint.prod.sh package.json package-lock.json ./
RUN npm ci

COPY --from=production_builder --chown=node:node $APP_PATH/dist/ ./dist/
COPY --from=production_builder --chown=node:node $APP_PATH/prisma/ ./prisma/
# needed for prisma to generate the client
RUN npx prisma generate

CMD ["./entrypoint.prod.sh"]

FROM base AS development
USER node
COPY --chown=node:node package.json package-lock.json tsconfig.json tsconfig.prod.json entrypoint.prod.sh  $APP_PATH/

RUN npm install