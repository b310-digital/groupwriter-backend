import { onRequestPayload, Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { PrismaClient } from "@prisma/client";
import { scheduleRemoveOldDocumentsCronJob } from "./crons/remove_old_documents_cron";
import {
  fetchDocument,
  updateLastAccessedAt,
  updateDocument,
} from "./model/document";
import { handleReadOnlyMode } from "./utils/hooks";
import httpRouter from "./httpRouter";

const prisma = new PrismaClient();

const server = Server.configure({
  port: parseInt(process.env.PORT, 10) || 3000,
  timeout: 30000,
  debounce: 5000,
  maxDebounce: 30000,
  extensions: [
    new Logger({
      onRequest: false,
      onChange: false,
      onConnect: false,
      onDisconnect: false,
      onUpgrade: false,
      onLoadDocument: false,
    }),
    new Database({
      fetch: async ({ documentName }) => {
        console.debug(`Fetching ${documentName}`);
        return (await fetchDocument(prisma, documentName))?.data;
      },
      store: async ({ documentName, state }) => {
        console.debug(`Storing ${documentName}`);
        await updateDocument(prisma, documentName, state);
      },
    }),
  ],
  onConnect: async ({ documentName }) => {
    const result = await fetchDocument(prisma, documentName);
    if (!result) {
      throw new Error("Document not found!");
    }
  },
  onAuthenticate: async ({ documentName, connection, token }) => {
    await handleReadOnlyMode(prisma, documentName, connection, token);
  },
  afterLoadDocument: async ({ documentName }) => {
    console.debug(`Updating lastAccessedAt for ${documentName}`);
    await updateLastAccessedAt(prisma, documentName);
  },
  onRequest: async (data: onRequestPayload) => {
    await httpRouter(data, prisma);
  },
});

scheduleRemoveOldDocumentsCronJob(prisma);

void server.listen();
