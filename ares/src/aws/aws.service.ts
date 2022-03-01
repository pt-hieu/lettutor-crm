import { Injectable } from '@nestjs/common'
import { S3 } from 'aws-sdk'

type TFile = {
  name: string
  buffer: Buffer
}

@Injectable()
export class AwsService {
  private s3: S3
  private bucket: string

  constructor() {
    this.s3 = new S3()
    this.bucket = process.env.AWS_S3_BUCKET_NAME
  }

  async uploadFile(dto: Array<TFile>) {
    return Promise.all(
      dto.map(async ({ buffer, name }) => {
        const uploadResult = await this.s3
          .upload({
            Bucket: this.bucket,
            Key: `${Date.now()}-${name}`,
            Body: buffer,
          })
          .promise()

        return {
          key: uploadResult.Key,
          location: uploadResult.Location,
        }
      }),
    )
  }
}
