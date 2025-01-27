import { PrismaClient } from "@prisma/client";
import { createDocument, deleteDocument } from "./model/document";
import { IncomingMessage, ServerResponse } from "http";
import formidable from "formidable";
import { createImage, deleteImage, getImage } from "./model/image";
import {
  downloadEncryptedImage,
  uploadEncryptedImage,
} from "./utils/uploaderDownloader";
import { checkPermission } from "./permissions";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { deleteImageFromBucket } from "./utils/s3";

export const handleCreateDocumentRequest = async (
  response: ServerResponse<IncomingMessage>,
  prisma: PrismaClient,
): Promise<void> => {
  console.debug(`Creating new document`);
  // return a new document:
  const document = await createDocument(prisma).catch((error: Error) => {
    console.error(error);
    throw error;
  });

  response.writeHead(200, { "Content-Type": "text/json" });
  response.end(JSON.stringify(document));
};

export const handleDeleteDocumentRequest = async (
  documentId: string,
  modificationSecret: string,
  response: ServerResponse<IncomingMessage>,
  prisma: PrismaClient,
): Promise<void> => {
  const result = await deleteDocument(prisma, documentId, modificationSecret);
  if (result) {
    response.writeHead(200);
  } else {
    response.writeHead(404);
  }
  response.end();
};

export const handleUploadImageRequest = async (
  documentId: string,
  modificationSecret: string,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
  prisma: PrismaClient,
): Promise<void> => {
  await checkPermission(prisma, documentId, modificationSecret, response);
  try {
    const form = formidable({ multiples: false });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_fields, files] = await form.parse(request);
    if (files["file"].length > 0) {
      const file = files["file"][0];
      const image = await createImage(
        prisma,
        documentId,
        file?.mimetype,
        file?.originalFilename,
      );
      await uploadEncryptedImage(image.id, image.mimetype, file?.filepath);

      if (image) {
        response.writeHead(200, { "Content-Type": "text/json" });
        response.end(JSON.stringify({ imageUrl: `images/${image.id}` }));
      } else {
        response.writeHead(422);
        response.end();
      }
    }
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end();
  }
};

export const handleGetImageRequest = async (
  imageId: string,
  response: ServerResponse<IncomingMessage>,
  prisma: PrismaClient,
): Promise<void> => {
  const getImageResult = await getImage(prisma, imageId);
  const downloadedImage = getImageResult
    ? await downloadEncryptedImage(imageId)
    : null;
  if (getImageResult && downloadedImage) {
    response.writeHead(200, {
      "Content-Type": getImageResult.mimetype,
      "Content-Disposition": "inline; filename=" + getImageResult.name,
    });
    await pipeline(Readable.from(downloadedImage), response);
  } else {
    response.writeHead(404);
  }
  response.end();
};

export const handleDeleteImageRequest = async (
  imageId: string,
  modificationSecret: string,
  response: ServerResponse<IncomingMessage>,
  prisma: PrismaClient,
): Promise<void> => {
  const image = await getImage(prisma, imageId);

  await checkPermission(
    prisma,
    image?.documentId,
    modificationSecret,
    response,
  );
  const deletedImageResult = await deleteImage(prisma, imageId);
  const result = deletedImageResult
    ? await deleteImageFromBucket(imageId)
    : null;
  if (deletedImageResult && result) {
    response.writeHead(204);
  } else {
    response.writeHead(404);
  }
  response.end();
};
