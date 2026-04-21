import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Initialize the S3 Client with your credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Higher-order function to create a multer-s3 upload middleware
 * @param {string} subFolder - The folder within the bucket (e.g., 'profile-pics', 'assignments')
 */
export const createS3Upload = (subFolder = 'uploads') => {
  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        // Generate a unique filename: subfolder/timestamp_originalName
        const fileName = `${subFolder}/${Date.now()}_${path.basename(file.originalname)}`;
        cb(null, fileName);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit by default
  });
};

// Default generic upload middleware
export const uploadToS3 = createS3Upload();

export default s3Client;
