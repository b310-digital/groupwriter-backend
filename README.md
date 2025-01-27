# GroupWriter: Backend

Yjs-backend with custom extensions, build on top of hocuspocus: https://tiptap.dev/docs/hocuspocus/introduction

## Setup

### Development

```
docker compose build
docker compose up -d
```

Migrations:

```
  Create a migration from changes in Prisma schema, apply it to the database, trigger generators (e.g. Prisma Client)
  $ npx prisma migrate dev

  Reset all migrations
  $ npx prisma db push --force-reset
```

Start the server:

```
docker compose exec app npm run start:dev
```

https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate

### Options / ENV Variables

- `PORT`: Port
- `DATABASE_URL`: Database host
- `OBJECT_STORAGE_BUCKET`: Bucket where to store uploads. The API needs to be s3-compatible.
- `OBJECT_STORAGE_SCHEME`: Schema for object storage, e.g. `http://` or `https://`
- `OBJECT_STORAGE_HOST`: Storage host, e.g. a container name
- `OBJECT_STORAGE_PORT`: Port for object storage
- `OBJECT_STORAGE_REGION`: Region for object storage, e.g. `local`
- `OBJECT_STORAGE_USER`: User for object storage
- `OBJECT_STORAGE_PASSWORD`: Password for object storage
- `VAULT_ENCRYPTION_KEY_BASE64`: Encryption key for the object storage, as every single item is encrypted. Needs to have a length of exactly 32 chars.
- `FEATURE_REMOVE_DOCUMENTS_TOGGLE`: Activate cleanup of inactive / old texts. Defaults to false.
- `FEATURE_REMOVE_DOCUMENTS_MAX_AGE_IN_DAYS`: Days after which inactive texts should be deleted. Defaults to 720.

## Testimonials / Sponsors

<img src="https://www.nibis.de/img/nlq-medienbildung.png" align="left" style="margin-right:20px">
<img src="https://kits.blog/wp-content/uploads/2021/03/kits_logo.svg" width=100px align="left" style="margin-right:20px">

kits is a project platform hosted by a public institution for quality
development in schools (Lower Saxony, Germany) and focusses on digital tools
and media in language teaching. GroupWriter can
be found on https://kits.blog/tools and can be used by schools for free.

Logos and text provided with courtesy of kits.
