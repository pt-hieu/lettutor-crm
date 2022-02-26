import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { File } from './file.entity'

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
  ) {}

  async uploadFile(dataBuffer: Buffer, filename: string) {
    const newFile = await this.fileRepo.create({
      filename,
      data: dataBuffer,
    })
    await this.fileRepo.save(newFile)
    return newFile
  }

  async getFileById(id: string) {
    const file = await this.fileRepo.findOne(id)
    if (!file) {
      throw new NotFoundException('File not found')
    }
    return file
  }
}
