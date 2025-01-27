import { decrypt, encrypt } from "./crypto";
import { getImageFromBucket, uploadImageToBucket } from "./s3";
import fs from "fs";

export const uploadEncryptedImage = async (
  imageId: string,
  mimetype: string,
  tmpFilepath: string,
): Promise<void> => {
  const data = fs.readFileSync(tmpFilepath);
  const encrypted = encrypt(data, imageId.slice(0, 16));
  await uploadImageToBucket(encrypted, imageId, mimetype);

  // Delete the tmp file from the server
  fs.rmSync(tmpFilepath);
};

export const downloadEncryptedImage = async (
  imageId: string,
): Promise<Buffer | null> => {
  const imageFromBucket = await getImageFromBucket(imageId);
  if (imageFromBucket) {
    return decrypt(
      Buffer.from(await imageFromBucket.Body.transformToByteArray()),
      imageId.slice(0, 16),
    );
  }
  return null;
};
