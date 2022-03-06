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
        const uploadResult = await this.s3
          .upload({
            Bucket: this.bucket,
            Key: `${Date.now()}-${name}`,
            Body: Buffer.from(buffer, 'base64'),
            ACL: 'public-read',
          })
          .promise()

        return {
          key: uploadResult.Key,
          location: uploadResult.Location,
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
