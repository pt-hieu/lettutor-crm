import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FileController } from './file.controller'
import { File } from './file.entity'
import { FileService } from './file.service'
import { FileSubscriber } from './file.subscriber'

import { Entity } from 'src/module/module.entity'


@Module({
  imports: [TypeOrmModule.forFeature([File, Entity]),
    HttpModule],
  controllers: [FileController],
  providers: [FileService, FileSubscriber],
  exports: [FileService],
})
export class FileModule {}
