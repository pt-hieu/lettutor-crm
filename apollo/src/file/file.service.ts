import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { UploadAttachment } from 'src/type/dto/file'

import { File } from './file.entity'

/** 20MB in bytes */
const MAX_SIZE_OF_FILES = 20971520

type TFile<T extends string | Buffer> = {
  name: string
  buffer: T
}

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
    private util: UtilService,
    private http: HttpService,
  ) { }

  async createEntityAttachments(id: string, dto: UploadAttachment) {
    const savedFiles = await this.uploadFile(dto.files)

    savedFiles.forEach((file) => {
      file[dto.entity + 'Id'] = id
    })

    return this.fileRepo.save(savedFiles)
  }

  async removeEntityAttachments(ids: string[]) {
    const files = await this.getManyFiles(ids)

    const fileKeys = []
    files.forEach((file) => {
      fileKeys.push(file.key)
    })

    await this.deleteFileByKeys(fileKeys)

    return this.fileRepo.remove(files)
  }

  async deleteFileByKeys(keys: string[]) {
    const deleteResult = await this.util.wrap<
      Promise<any>
    >(this.http.post(this.util.aresService + '/aws/s3/batch-delete', keys))

    return deleteResult
  }

  async uploadFile(files: TFile<string>[]) {
    this.doValidateFiles(files)

    const uploadResult = await this.util.wrap<
      { key: string; location: string; size: number }[]
    >(this.http.post(this.util.aresService + '/aws/s3', files))

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

  async getManyFiles(ids: string[]) {
    const files = await this.fileRepo.findByIds(ids)

    if (!files) {
      throw new NotFoundException('File not found')
    }

    return files
  }
}
