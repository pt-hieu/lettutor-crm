module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        accessKeyId: env("AWS_ACCESS_KEY_ID"),
        secretAccessKey: env("AWS_ACCESS_SECRET"),
        region: env("AWS_REGION"),
        params: {
          Bucket: env("AWS_BUCKET_NAME"),
          StorageClass: env("AWS_S3_STORAGE_CLASSES"),
          CreateBucketConfiguration: {
            LocationConstraint: env("AWS_REGION"),
          },
        },
      },
    },
  },
});
