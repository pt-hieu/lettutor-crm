import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { UtilService } from 'src/global/util.service'
import { Entity } from 'src/module/module.entity'
import { Task } from 'src/task/task.entity'
import { DTO } from 'src/type'

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

    @InjectRepository(Entity) private entityRepo: Repository<Entity>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,

    private util: UtilService,
    private http: HttpService,
  ) {}

  async createEntityAttachments(entityId: string, dto: DTO.File.Files) {
    const savedFiles = await this.uploadFile(dto.files)

    const [entity, task] = await Promise.all([
      this.entityRepo.findOne({ where: { id: entityId } }),
      this.taskRepo.findOne({
        where: {
          id: entityId,
        },
      }),
    ])

    savedFiles.forEach((file) => {
      if (entity) file.entityId = entityId
      if (task) file.taskId = entityId
    })

    return this.fileRepo.save(savedFiles)
  }

  createEntityExternalAttachment(
    entityId: string,
    dto: DTO.File.UploadExternalAttachment,
  ) {
    return this.fileRepo.save({
      ...dto,
      entityId,
      external: true,
      size: 0,
    })
  }

  async updateExternalAttachment(id: string, dto: DTO.File.UpdateAttachment) {
    const attachment = await this.fileRepo.findOne({ where: { id } })

    if (!attachment) throw new NotFoundException('Attachment not found')
    if (!attachment.external)
      throw new UnprocessableEntityException('Attachment can not be update')

    return this.fileRepo.save({
      ...attachment,
      ...dto,
    })
  }

  async removeEntityAttachments(ids: string[]) {
    const files = await this.fileRepo.find({ where: { id: In(ids) } })

    return this.fileRepo.remove(files)
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
}
