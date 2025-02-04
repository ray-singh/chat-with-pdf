import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";

/**
 * Downloads a file from AWS S3 and saves it locally.
 * @param file_key - The key (path) of the file in the S3 bucket.
 * @returns A promise that resolves with the local file path or rejects on error.
 */
export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Initialize the S3 client with region and credentials
      const s3 = new S3({
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
      const obj = await s3.getObject(params);

      // Generate a unique file name for saving the file locally
      const file_name = `/tmp/elliott${Date.now().toString()}.pdf`;

      // Ensure the response body is a readable stream
      if (obj.Body instanceof require("stream").Readable) {
        // Create a writable stream for saving the file locally
        const file = fs.createWriteStream(file_name);

        file.on("open", function (fd) {
          // @ts-ignore: Ignore TypeScript warning related to obj.Body typing issues
          obj.Body?.pipe(file).on("finish", () => {
            // Resolve with the local file path once download is complete
            return resolve(file_name);
          });
        });
      }
    } catch (error) {
      console.error(error); // Log any errors that occur
      reject(error); // Reject the promise with the error
      return null; // Return null (though it's unnecessary since the promise is already rejected)
    }
  });
}