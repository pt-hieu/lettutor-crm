import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileController } from './file.controller'
import { File } from './file.entity'
import { FileService } from './file.service'
import { FileSubscriber } from './file.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([File]), HttpModule],
  controllers: [FileController],
  providers: [FileService, FileSubscriber],
  exports: [FileService],
})
export class FileModule {}
