import AWS from 'aws-sdk'

// This function uploads a file to an S3 bucket and returns the file's key and name.
export async function uploadToS3(file: File) {
  try {
      // Configuring AWS SDK with access and secret keys from environment variables
      AWS.config.update({
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID, // Access key from environment variables
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY, // Secret key from environment variables
      });

      // Create an instance of the S3 service
      const s3 = new AWS.S3({
          params: {
              Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME, // The bucket name
              Region: 'us-east-2' // S3 region for the bucket
          }
      });

      // Generate a unique file key (name) for the file in S3 by combining the current timestamp and the file's original name
      const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ', '-'); // File path and name

      // Define the parameters for the S3 upload
      const params = {
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!, // Bucket name from environment variables
          Key: file_key, // File key (unique name in the bucket)
          Body: file, // The file to be uploaded
      };

      // Perform the file upload to S3 and track upload progress
      const upload = s3
          .putObject(params) // Upload the file to S3 using `putObject`
          .on('httpUploadProgress', (evt) => {
              // Log the upload progress (percentage of upload completed)
              console.log("Uploading to S3...", parseInt(((evt.loaded * 100) / evt.total).toString()) + "%");
          })
          .promise(); // Convert the upload to a promise

      // Wait for the upload to complete and handle success
      await upload.then(data => {
          // Log success message once the file is uploaded
          console.log("Successfully uploaded to S3!", file_key);
      });

      // Return the file's key and name in a resolved promise after successful upload
      return Promise.resolve({
          file_key, // The unique key assigned to the file in S3
          file_name: file.name // The original name of the file
      });

  } catch (error) {
      // Handle any errors that occur during the upload
      console.error("Error uploading file to S3:", error);
      throw new Error("Error uploading to S3");
  }
}


export function getS3Url(file_key: string) {
    console.log("Getting S3 Url...");
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`;
    console.log("URL: ", url);
    return url;
  }