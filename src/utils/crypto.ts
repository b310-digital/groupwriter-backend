import crypto from "crypto";

const algorithm = "aes-256-cbc";

export const encrypt = (data: Buffer, iv: string): Buffer => {
  const cipher = crypto.createCipheriv(
    algorithm,
    process.env.VAULT_ENCRYPTION_KEY_BASE64,
    iv,
  );
  const encrypted = cipher.update(data);
  return Buffer.concat([encrypted, cipher.final()]);
};

export const decrypt = (data: Buffer, iv: string): Buffer => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.VAULT_ENCRYPTION_KEY_BASE64,
    iv,
  );
  const decrypted = decipher.update(data);
  return Buffer.concat([decrypted, decipher.final()]);
};
