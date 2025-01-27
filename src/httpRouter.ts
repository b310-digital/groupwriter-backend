import {
  handleCreateDocumentRequest,
  handleDeleteDocumentRequest,
  handleDeleteImageRequest,
  handleGetImageRequest,
  handleUploadImageRequest,
} from "./httpHandler";
import { PrismaClient } from "@prisma/client";
import { onRequestPayload } from "@hocuspocus/server";

/*
  This very basic router is used to handle the http requests to the server.
  The reject pattern is used as it is needed for hocuspocus control flow.
*/
const httpRouter = async (data: onRequestPayload, prisma: PrismaClient) => {
  const { request, response } = data;
  const method = request.method;
  const splittedUrl = request.url?.split("/");
  const resource = splittedUrl[1];
  const subResource = splittedUrl.length > 3 ? splittedUrl[3] : null;
  const resourceId = splittedUrl.length > 2 ? splittedUrl[2] : null;
  const modificationSecret = request.headers.authorization;

  if (method === "POST" && resource === "documents" && !subResource) {
    await handleCreateDocumentRequest(response, prisma);
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject();
  }

  if (method === "DELETE" && resource === "documents" && !subResource) {
    await handleDeleteDocumentRequest(
      resourceId,
      modificationSecret,
      response,
      prisma,
    );
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject();
  }

  if (
    method === "POST" &&
    resource === "documents" &&
    subResource === "images"
  ) {
    await handleUploadImageRequest(
      resourceId,
      modificationSecret,
      request,
      response,
      prisma,
    );
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject();
  }

  if (method === "GET" && resource === "images") {
    await handleGetImageRequest(resourceId, response, prisma);
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject();
  }

  if (method === "DELETE" && resource === "images") {
    await handleDeleteImageRequest(
      resourceId,
      modificationSecret,
      response,
      prisma,
    );
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject();
  }
};

export default httpRouter;
