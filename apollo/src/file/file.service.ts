import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UtilService } from 'src/global/util.service'
import { Repository } from 'typeorm'
import { File } from './file.entity'

const MAX_SIZE_OF_FILES = 20971520 // 20MB in binary
type TFile<T extends string | Buffer> = {
  name: string
  buffer: T
}
@Injectable()
export class FileService {
  private ares: string

  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
    private util: UtilService,
    private http: HttpService,
  ) {
    this.ares = process.env.ARES_SERVICE
  }

  async uploadFile(files: TFile<string>[]) {
    this.doValidateFiles(files)
    const uploadResult = await this.util.wrap<
      { key: string; location: string }[]
    >(this.http.post(this.ares + '/aws/s3', files))

    return this.fileRepo.save(uploadResult)
  }

  async getFileById(id: string) {
    const file = await this.fileRepo.findOne(id)

    if (!file) {
      throw new NotFoundException('File not found')
    }

    return file
  }

  doValidateFiles(files: TFile<string>[]) {
    const totalSize = files.reduce(
      (size, file) => size + Buffer.from(file.buffer, 'base64').byteLength,
      0,
    )

    if (totalSize > MAX_SIZE_OF_FILES) {
      throw new BadRequestException('The total size of files exceeds 20MB')
    }
  }
}
