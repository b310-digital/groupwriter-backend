import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { deleteImage } from "./image";
import { deleteImageFromBucket } from "../utils/s3";
import { isValidUUID } from "../utils/validators";

export const createDocument = async (prisma: PrismaClient) => {
  return prisma.document.create({ data: {} });
};

export const fetchDocument = async (
  prisma: PrismaClient,
  documentName: string,
) => {
  if (!documentName || !isValidUUID(documentName)) return null;

  return prisma.document.findFirst({
    where: {
      id: documentName,
    },
    select: {
      id: true,
      data: true,
      modificationSecret: true,
    },
  });
};

export const updateDocument = async (
  prisma: PrismaClient,
  documentName: string,
  state: Uint8Array,
) => {
  if (!isValidUUID(documentName)) return false;

  try {
    await prisma.document.update({
      where: { id: documentName },
      data: {
        data: state,
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    // P2025 is the error code for a document not found
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return false;
    console.log(error);
    return false;
  }
};

export const deleteOldDocuments = async (prisma: PrismaClient) => {
  try {
    const date = deleteOlderThanDate();
    console.info(`Deleting documents older than ${date.toString()}`);

    const toDelete = await prisma.document.findMany({
      where: {
        lastAccessedAt: {
          lt: date,
        },
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      toDelete.map(async (document) => {
        return deleteDocumentWithImages(prisma, document.id);
      }),
    );

    console.info(`Cleanup job complete. Deleted ${toDelete.length} documents.`);
  } catch (error) {
    console.error("Error during cleanup job:", error);
  }
};

export const deleteDocument = async (
  prisma: PrismaClient,
  documentName: string,
  modificationSecret: string,
): Promise<boolean> => {
  try {
    console.info(`Deleting document ${documentName}`);

    const document = await prisma.document.findFirst({
      where: {
        id: documentName,
        modificationSecret: modificationSecret,
      },
      select: {
        id: true,
      },
    });

    if (!document) return false;

    await deleteDocumentWithImages(prisma, document.id);
    return true;
  } catch (error) {
    // P2025 is the error code for a document not found
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return false;
    console.log(error);
    return false;
  }
};

export const updateLastAccessedAt = async (
  prisma: PrismaClient,
  documentName: string,
) => {
  if (!isValidUUID(documentName)) return false;

  try {
    await prisma.document.update({
      where: { id: documentName },
      data: { lastAccessedAt: new Date() },
    });
  } catch {
    console.info(`Document ${documentName} does not exist yet`);
  }
};

export const isValidModificationSecret = async (
  prisma: PrismaClient,
  documentName: string,
  modificationSecret: string,
) => {
  if (!isValidUUID(documentName)) return false;

  const document = await fetchDocument(prisma, documentName);
  if (!document) throw new Error("Document not found!");

  return document.modificationSecret === modificationSecret;
};

const MAX_AGE_IN_DAYS = parseInt(
  process.env.FEATURE_REMOVE_DOCUMENTS_MAX_AGE_IN_DAYS ?? "730",
  10,
);

const deleteOlderThanDate = () => {
  const deleteOlderThanDate = new Date();
  deleteOlderThanDate.setDate(deleteOlderThanDate.getDate() - MAX_AGE_IN_DAYS);
  return deleteOlderThanDate;
};

const deleteDocumentWithImages = async (
  prisma: PrismaClient,
  documentId: string,
) => {
  const images = await prisma.image.findMany({
    where: {
      documentId: documentId,
    },
  });
  await Promise.all(
    images.map((image) => {
      // Delete images from database and from bucket
      return deleteImageAndBucketFile(prisma, image.id);
    }),
  );

  return prisma.document.delete({
    where: {
      id: documentId,
    },
  });
};

const deleteImageAndBucketFile = async (
  prisma: PrismaClient,
  imageId: string,
): Promise<void> => {
  await deleteImage(prisma, imageId);
  await deleteImageFromBucket(imageId);
};
