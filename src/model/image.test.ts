import { PrismockClient } from "prismock";
import { describe, expect, it } from "vitest";
import { createImage, deleteImage, getImage } from "./image";
import { randomUUID } from "crypto";
import { createExampleImage } from "../../tests/helpers/imageHelpers";

const prisma = new PrismockClient();

describe("createImage", () => {
  it("should create an image", async () => {
    const image = await createImage(
      prisma,
      randomUUID(),
      "image/png",
      "test.png",
    );
    expect(image).not.toBeNull();
  });

  it("should set an anonymized image name", async () => {
    const image = await createImage(
      prisma,
      randomUUID(),
      "image/png",
      "test.png",
    );
    expect(image.name).toBe("image.png");
  });
});

describe("deleteImage", () => {
  it("should delete an image", async () => {
    const image = await createExampleImage(prisma, randomUUID());
    await deleteImage(prisma, image.id);
    const afterImage = await prisma.image.findFirst({
      where: { id: image.id },
    });
    expect(afterImage).toBeNull();
  });
});

describe("getImage", () => {
  it("should get an image", async () => {
    const image = await createExampleImage(prisma, randomUUID());
    const fetchedImage = await getImage(prisma, image.id);
    expect(fetchedImage).not.toBeNull();
  });

  it("returns null if the image does not exist", async () => {
    const fetchedImage = await getImage(prisma, randomUUID());
    expect(fetchedImage).toBeNull();
  });

  it("returns null if the parameter is undefined", async () => {
    const fetchedImage = await getImage(prisma, undefined);
    expect(fetchedImage).toBeNull();
  });
});
