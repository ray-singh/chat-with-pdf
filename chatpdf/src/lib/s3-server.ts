import AWS from "aws-sdk";
import fs from "fs";

// Define AWS error type since AWS.AWSError is not directly accessible
interface AWSErrorType extends Error {
  code?: string;
  statusCode?: number;
  retryable?: boolean;
  requestId?: string;
  service?: string;
  region?: string;
  time?: Date;
  message: string;
}

/**
 * Downloads a file from AWS S3 and saves it locally.
 * @param file_key - The key (path) of the file in the S3 bucket.
 * @returns A promise that resolves with the local file path or rejects on error.
 */
export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Initialize the S3 client with region and credentials
      const s3 = new AWS.S3({
        region: "us-east-2",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });

      // Define parameters for fetching the file from S3
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!, // Bucket name from env variables
        Key: file_key, // File key (path) in the S3 bucket
      };

      // Fetch the object from S3
      s3.getObject(params, (err, data) => {
        if (err) {
          console.error("Error downloading from S3:", err);
          reject(err);
          return;
        }

        // Generate a unique file name for saving the file locally
        const file_name = `/tmp/ray${Date.now().toString()}.pdf`;

        // Save the file locally
        fs.writeFile(file_name, data.Body as Buffer, (writeErr) => {
          if (writeErr) {
            console.error("Error saving file locally:", writeErr);
            reject(writeErr);
            return;
          }
          console.log("File downloaded successfully:", file_name);
          resolve(file_name);
        });
      });
    } catch (error: unknown) {
      // Type guard for error handling
      const typedError = error as Error;
      console.error("Unexpected error:", typedError.message);
      reject(new Error(`Failed to process S3 download: ${typedError.message}`));
    }
  });
}

/**
 * Helper function to check if a file exists in S3
 * @param file_key - The key (path) of the file in the S3 bucket
 * @returns Promise<boolean> - Whether the file exists
 */
export async function checkFileExists(file_key: string): Promise<boolean> {
  try {
    const s3 = new AWS.S3({
      region: "us-east-2",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    await s3.headObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    }).promise();

    return true;
  } catch (error: unknown) {
    const awsError = error as AWSErrorType;
    if (awsError.code === 'NotFound') {
      return false;
    }
    throw new Error(`Error checking file existence: ${awsError.message}`);
  }
}

/**
 * Helper function to validate S3 configuration
 * @throws Error if required environment variables are missing
 */
function validateS3Config(): void {
  const requiredEnvVars = {
    'NEXT_PUBLIC_S3_ACCESS_KEY_ID': process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    'NEXT_PUBLIC_S3_SECRET_ACCESS_KEY': process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    'NEXT_PUBLIC_S3_BUCKET_NAME': process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required S3 configuration: ${missingVars.join(', ')}`);
  }
}