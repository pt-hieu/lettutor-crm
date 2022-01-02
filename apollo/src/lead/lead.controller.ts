import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { LeadService } from './lead.service'

@ApiTags('lead')
@ApiBearerAuth('jwt')
@Controller('lead')
export class LeadController {
  constructor(
    private readonly service: LeadService,
    private readonly utilService: UtilService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'view, search and filter all leads' })
  index(@Query() query: DTO.Lead.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_LEAD)
  @ApiOperation({ summary: 'to add new lead manually' })
  addLead(@Body() dto: DTO.Lead.AddLead) {
    return this.service.addLead(dto)
  }

  @Get(':id')
  @DefineAction(Actions.VIEW_ALL_LEAD_DETAILS)
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_LEAD_DETAILS)
  @DefineAction(Actions.VIEW_AND_CONVERT_LEAD_DETAILS)
  @ApiOperation({ summary: 'to get lead information by Id' })
  getLeadById(@Param('id', ParseUUIDPipe) id: string) {
    const relations = ['owner']

    if (this.utilService.checkRoleAction(Actions.VIEW_ALL_TASKS)) {
      relations.push('tasks', 'tasks.owner')
    }

    return this.service.getLeadById(
      {
        where: { id },
        relations,
      },
      true,
    )
  }

  @Patch(':id')
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_LEAD_DETAILS)
  @ApiOperation({ summary: 'to update lead manually' })
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Lead.UpdateLead,
  ) {
    return this.service.updateLead(dto, id)
  }

  @Post(':id/convert')
  @DefineAction(Actions.VIEW_AND_CONVERT_LEAD_DETAILS)
  @ApiOperation({ summary: 'to convert lead to account, contact and lead' })
  @ApiBody({ required: false, type: DTO.Deal.ConvertToDeal })
  async convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: object,
    @Query('ownerId', new DefaultValuePipe(undefined), ParseUUIDPipe)
    ownerId?: string,
  ) {
    const shouldConvertToDeal = Object.keys(body).length !== 0
    let dto: DTO.Deal.ConvertToDeal

    if (shouldConvertToDeal) {
      dto = plainToClass(DTO.Deal.ConvertToDeal, body, {
        ignoreDecorators: false,
      })

      const errors = await validate('ConvertToDeal', dto)
      if (errors.length)
        throw new BadRequestException(
          errors.map((e) => Object.values(e.constraints)).flat(),
        )
    }

    return this.service.convert(id, dto, shouldConvertToDeal, ownerId)
  }
}