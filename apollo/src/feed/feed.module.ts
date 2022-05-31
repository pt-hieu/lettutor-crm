import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { File } from 'src/file/file.entity'
import { FileModule } from 'src/file/file.module'

import { Comment } from './comment.entity'
import { FeedController } from './feed.controller'
import { FeedService } from './feed.service'
import { Status } from './status.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Status, Comment, File]), FileModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
