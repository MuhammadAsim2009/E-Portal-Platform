import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const fileName = `${subFolder}/${Date.now()}_${path.basename(file.originalname)}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.docx', '.zip', '.png', '.jpg', '.jpeg'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, DOCX, ZIP, JPG, and PNG are allowed.'));
      }
    },
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  });
};

// Default generic upload middleware
export const uploadToS3 = createS3Upload();

/**
 * Generate a pre-signed URL for a private S3 object.
 * Extracts the S3 key from the full file URL and returns a 15-minute signed URL.
 * @param {string} fileUrl - The full S3 URL stored in the DB (e.g. https://bucket.s3.region.amazonaws.com/assignments/file.pdf)
 * @param {string} action - 'view' or 'download'
 * @param {number} expiresIn - Expiry in seconds (default: 900 = 15 min)
 */
export const getSignedFileUrl = async (fileUrl, action = 'view', expiresIn = 900) => {
  const url = new URL(fileUrl);
  // The key is the pathname without the leading slash
  const key = decodeURIComponent(url.pathname.slice(1));
  const filename = path.basename(key);
  const ext = path.extname(filename).toLowerCase();
  
  // Map extensions to content types for better browser "View" support
  const contentTypeMap = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.zip': 'application/zip'
  };

  const commandConfig = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ResponseContentDisposition: action === 'view' 
      ? `inline; filename="${filename}"` 
      : `attachment; filename="${filename}"`,
  };

  if (action === 'view' && contentTypeMap[ext]) {
    commandConfig.ResponseContentType = contentTypeMap[ext];
  }

  const command = new GetObjectCommand(commandConfig);
  
  return getSignedUrl(s3Client, command, { expiresIn });
};

export default s3Client;
