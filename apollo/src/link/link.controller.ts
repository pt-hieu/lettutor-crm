import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DTO } from 'src/type'

import { LinkService } from './link.service'

@Controller('link')
@ApiTags('link')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class LinkController {
  constructor(private service: LinkService) {}

  @Post()
  @ApiOperation({ summary: 'to attach new link manually' })
  addLink(@Body() dto: DTO.Link.AddLink) {
    return this.service.addLink(dto)
  }

  @Get()
  @ApiOperation({ summary: 'view, search and filter all links' })
  index(@Query() query: DTO.Link.GetManyLinks) {
    return this.service.getMany(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get link information by Id' })
  getLinkById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getLinkById({
      where: { id },
      relations: ['owner'],
    })
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to update link manually' })
  updateLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Link.UpdateLink,
  ) {
    return this.service.updateLink(dto, id)
  }

  @Delete('batch')
  @ApiOperation({ summary: 'to batch delete one or many link' })
  deleteAttachmentLink(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
