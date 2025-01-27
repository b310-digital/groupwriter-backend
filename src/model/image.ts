import { PrismaClient } from "@prisma/client";
import type { Image } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isValidUUID } from "../utils/validators";

export const createImage = async (
  prisma: PrismaClient,
  documentId: string,
  mimetype: string,
  name: string,
): Promise<Image | null> => {
  if (!validateImageParams(documentId, mimetype, name)) return null;

  // for data privacy reasons, currently the image name is not stored in the database but an anonymized version
  const imageName = `image${getImageType(mimetype)}`;

  try {
    const image = await prisma.image.create({
      data: {
        name: imageName,
        mimetype: mimetype,
        documentId: documentId,
        updatedAt: new Date(),
      },
    });

    return image;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getImage = async (
  prisma: PrismaClient,
  imageId: string | undefined,
): Promise<Image | null> => {
  if (!imageId || !isValidUUID(imageId)) return null;

  try {
    return prisma.image.findUnique({
      where: { id: imageId },
    });
  } catch (error) {
    // P2025 is the error code for a id not found
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }
    console.error(error);
    return null;
  }
};

export const deleteImage = async (
  prisma: PrismaClient,
  imageId: string,
): Promise<Image> => {
  if (!imageId || !isValidUUID(imageId)) return null;

  try {
    return prisma.image.delete({
      where: { id: imageId },
    });
  } catch (error) {
    // P2025 is the error code for a id not found
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }
    console.error(error);
    return null;
  }
};

const validateImageParams = (
  documentId: string,
  mimetype: string,
  name: string,
): boolean => {
  return (
    documentId &&
    mimetype &&
    name &&
    mimetype.split("/")[0] === "image" &&
    isValidUUID(documentId)
  );
};

const getImageType = (mimetype: string) => {
  const mimeTypeEnding = mimetype.split("/")[1];
  switch (mimeTypeEnding) {
    case "jpeg":
      return ".jpg";
    case "gif":
      return ".gif";
    case "png":
      return ".png";
    default:
      return "";
  }
};
