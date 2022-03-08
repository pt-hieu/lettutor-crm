import { Injectable } from '@nestjs/common'
import { S3 } from 'aws-sdk'

import { UploadFiles } from './dto/s3.dto'

@Injectable()
export class AwsService {
  private s3: S3
  private bucket: string

  constructor() {
    this.s3 = new S3()
    this.bucket = process.env.AWS_S3_BUCKET_NAME
  }

  async uploadFile(dto: Array<UploadFiles>) {
    return Promise.all(
      dto.map(async ({ buffer, name }) => {
        const [extension] = name.split('.').slice(-1)
        name = name.replace(extension, '')

        const uploadResult: S3.ManagedUpload.SendData = await this.s3
          .upload({
            Bucket: this.bucket,
            Key: `${name}-${Date.now()}.${extension}`,
            Body: Buffer.from(buffer, 'base64'),
            ACL: 'public-read',
          })
          .promise()

        const size = await this.s3
          .headObject({ Bucket: this.bucket, Key: uploadResult.Key })
          .promise()
          .then((r) => r.ContentLength)

        return {
          key: uploadResult.Key,
          location: uploadResult.Location,
          size,
        }
      }),
    )
  }

  deleteFile(keys: string[]) {
    return this.s3
      .deleteObjects({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      })
      .promise()
  }
}
