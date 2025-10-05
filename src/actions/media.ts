"use server";

import { createUserFile } from "@/data/files";
import { getSession } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string } }
  | { failure: string; success?: undefined }
>;

type GetSignedURLParams = {
  fileName: string;
  fileType: string;
  fileSize: number;
  checksum: string;
};

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const allowedFileTypes = ["text/csv"];

const maxFileSize = 1048576 * 10 * 10; // 10 MB

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedURL({
  fileName,
  fileType,
  fileSize,
  checksum,
}: GetSignedURLParams): SignedURLResponse {
  const session = await getSession();

  if (!session) {
    return { failure: "Not authenticated" };
  }

  if (!allowedFileTypes.includes(fileType)) {
    return { failure: "File type not allowed" };
  }

  if (fileSize > maxFileSize) {
    return { failure: "File size too large" };
  }

  const fileKey = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: session.user.id,
    },
  });

  const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 });

  await createUserFile(fileKey, fileType, fileName);

  return { success: { url } };
}
