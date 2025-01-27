import { PrismaClient } from "@prisma/client";

export const buildExampleDocument = (lastAccessedAt?: Date) => {
  const data = new TextEncoder().encode("example");
  return { data: data, lastAccessedAt: lastAccessedAt };
};

export const createExampleDocument = async (
  prisma: PrismaClient,
  lastAccessedAt?: Date,
) => {
  const document = buildExampleDocument(lastAccessedAt);
  return prisma.document.create({
    data: document,
  });
};
