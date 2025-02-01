import { ConnectionConfiguration } from "@hocuspocus/server";
import { isValidModificationSecret } from "../model/document";
import { PrismaClient } from "@prisma/client";

export const handleReadOnlyMode = async (
  prisma: PrismaClient,
  documentName: string,
  connection: ConnectionConfiguration,
  token: string,
) => {
  connection.readOnly =
    token === "readOnly" ||
    !(token && (await isValidModificationSecret(prisma, documentName, token)));
};
