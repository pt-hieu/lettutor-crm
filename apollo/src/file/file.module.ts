import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Entity } from 'src/module/module.entity'
import { Task } from 'src/task/task.entity'

import { FileController } from './file.controller'
import { File } from './file.entity'
import { FileService } from './file.service'
import { FileSubscriber } from './file.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([File, Entity, Task]), HttpModule],
  controllers: [FileController],
  providers: [FileService, FileSubscriber],
  exports: [FileService],
})
export class FileModule {}
