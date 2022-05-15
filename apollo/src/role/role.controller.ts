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

import { DefineAction } from 'src/action.decorator'
import { ActionType, DefaultActionTarget } from 'src/action/action.entity'
import { DTO } from 'src/type'

import { RoleService } from './role.service'

@Controller('role')
@ApiTags('role')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class RoleController {
  constructor(private service: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'to get all role' })
  getMany(@Query() query: DTO.Role.GetManyRole) {
    return this.service.getManyRole(query)
  }

  @Post()
  @DefineAction({
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_CREATE_NEW,
  })
  @ApiOperation({ summary: 'to create a role' })
  create(@Body() dto: DTO.Role.CreateRole) {
    return this.service.createRole(dto)
  }

  @Patch(':id')
  @DefineAction({
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
  })
  @ApiOperation({ summary: 'to update a role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Role.UpdateRole,
  ) {
    return this.service.updateRole(id, dto)
  }

  @Delete(':id')
  @DefineAction({
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_DELETE_ANY,
  })
  @ApiOperation({ summary: 'to delete a role' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeRole(id)
  }

  @Post(':id/default')
  @DefineAction({
    target: DefaultActionTarget.ROLE,
    type: ActionType.CAN_RESTORE_REVERSED,
  })
  @ApiOperation({ summary: 'to restore default action for role' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.restoreDefault(id)
  }
}
