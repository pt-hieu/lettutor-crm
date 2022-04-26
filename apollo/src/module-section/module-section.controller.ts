import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { DTO } from 'src/type'

import { SectionService } from './module-section.service'

@ApiTags('module-section')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('module-section')
export class SectionController {
  constructor(private readonly service: SectionService) {}

  @Get(':moduleId')
  @ApiOperation({ summary: 'view all sections in one module' })
  index(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.service.getSectionsByModule(moduleId)
  }

  @Post(':moduleId')
  //   @DefineAction({
  //     target: DefaultActionTarget.DEAL_STAGE,
  //     type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  //   })
  @ApiOperation({ summary: 'to modify all module' })
  addDeal(
    @Body() dto: DTO.Section.ExposeDto,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
  ) {
    return this.service.modifySections(moduleId, dto.items)
  }
}
