import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

export const buildExampleImage = (documentId: string) => {
  return {
    documentId: documentId,
    name: "test.png",
    mimetype: "image/png",
  };
};

export const buildFullExampleImage = (documentId: string) => {
  return {
    id: randomUUID(),
    documentId: documentId,
    name: "test.png",
    mimetype: "image/png",
    updatedAt: new Date(),
    createdAt: new Date(),
  };
};

export const createExampleImage = async (
  prisma: PrismaClient,
  documentId: string,
) => {
  return prisma.image.create({
    data: buildExampleImage(documentId),
  });
};
