import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export type StoredAudio = {
  key: string;
  url: string;
};

const localUploadDir = path.resolve(process.cwd(), "uploads");

function getExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension || ".audio";
}

function createAudioKey(fileName: string) {
  return `audio/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${getExtension(fileName)}`;
}

function getS3Client() {
  return new S3Client({
    region: env.AWS_REGION,
    endpoint: env.AWS_S3_ENDPOINT,
    forcePathStyle: env.AWS_FORCE_PATH_STYLE,
    credentials:
      env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            sessionToken: env.AWS_SESSION_TOKEN
          }
        : undefined
  });
}

function getPublicUrl(key: string) {
  if (env.AWS_S3_PUBLIC_BASE_URL) {
    return `${env.AWS_S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }

  if (!env.AWS_S3_BUCKET) {
    return `/uploads/${key}`;
  }

  return `s3://${env.AWS_S3_BUCKET}/${key}`;
}

export async function storeAudio(file: Express.Multer.File): Promise<StoredAudio> {
  const key = createAudioKey(file.originalname);

  if (env.AWS_S3_BUCKET) {
    const client = getS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || "application/octet-stream"
      })
    );

    return {
      key,
      url: getPublicUrl(key)
    };
  }

  const outputPath = path.join(localUploadDir, key);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, file.buffer);

  return {
    key,
    url: getPublicUrl(key)
  };
}
