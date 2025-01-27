import { PrismaClient } from "@prisma/client";
import { ServerResponse } from "http";
import { fetchDocument } from "./model/document";

const checkModificationSecret = async (
  prisma: PrismaClient,
  documentId: string,
  modificationSecret: string,
) => {
  const document = await fetchDocument(prisma, documentId);
  return (
    document &&
    document.modificationSecret &&
    document.modificationSecret === modificationSecret
  );
};

export const checkPermission = async (
  prisma: PrismaClient,
  documentId: string,
  modificationSecret: string,
  response: ServerResponse,
) => {
  if (
    !(await checkModificationSecret(prisma, documentId, modificationSecret))
  ) {
    response.writeHead(403);
    response.end();
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject();
  }
  return Promise.resolve();
};
