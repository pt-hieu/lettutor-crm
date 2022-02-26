import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { File } from './file.entity'

const MAX_SIZE_OF_FILES = 20971520 // 20MB in binary
@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
  ) {}

  // @ts-expect-error
  async uploadFile(files: Express.Multer.File[]) {
    this.checkFileConstraints(files)

    const filesToAdd = []

    for (let file of files) {
      const newFile = await this.fileRepo.create({
        data: file.buffer,
        filename: file.originalname,
      })

      await this.fileRepo.save(newFile)
      filesToAdd.push(newFile)
    }

    return filesToAdd
  }

  async getFileById(id: string) {
    const file = await this.fileRepo.findOne(id)
    if (!file) {
      throw new NotFoundException('File not found')
    }
    return file
  }

  // @ts-expect-error
  checkFileConstraints(files: Express.Multer.File[]) {
    let totalSize = 0
    for (let file of files) {
      totalSize += file.size
    }

    if (totalSize > MAX_SIZE_OF_FILES) {
      throw new BadRequestException('The total size of files exceeds 20MB')
    }
  }
}
