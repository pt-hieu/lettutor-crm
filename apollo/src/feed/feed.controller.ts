import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DTO } from 'src/type'
import { FeedCategory } from 'src/type/dto/feed'

import { FeedService } from './feed.service'

const MAX_COUNT_OF_FILES = 5

@ApiTags('feed')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('feed')
export class FeedController {
  constructor(private readonly service: FeedService) {}

  @Get('')
  @ApiOperation({ summary: 'to view and filter all statuses' })
  getManyStatuses(@Query() query: DTO.Feed.FeedFilter) {
    return this.service.getManyStatuses(query)
  }

  @Get('comment/:feedId')
  @ApiOperation({ summary: 'to view and filter all statuses' })
  getCommentsByFeedId(
    @Param('feedId', ParseUUIDPipe) feedId: string,
    @Query() feedCategory: FeedCategory,
  ) {
    return this.service.getCommentsByFeedId(feedId, feedCategory)
  }

  @Post('status')
  @ApiOperation({ summary: 'to add new status' })
  addStatus(@Body() dto: DTO.Feed.AddStatus) {
    if (dto.files.length > MAX_COUNT_OF_FILES) {
      throw new BadRequestException('The number of file exceeds the limitation')
    }

    return this.service.addStatus(dto)
  }

  @Post('comment')
  @ApiOperation({ summary: 'to add new comment' })
  addComment(@Body() dto: DTO.Feed.AddComment) {
    if (dto.files.length > MAX_COUNT_OF_FILES) {
      throw new BadRequestException('The number of file exceeds the limitation')
    }

    return this.service.addComment(dto)
  }

  @Delete('status/batch')
  @ApiOperation({ summary: 'to batch delete a status' })
  deleteStatus(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDeleteStatus(dto.ids)
  }

  @Delete('comment/batch')
  @ApiOperation({ summary: 'to batch delete a comment' })
  deleteComment(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDeleteComment(dto.ids)
  }
}
