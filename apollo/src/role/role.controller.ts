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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { RoleService } from './role.service'

@Controller('role')
@ApiTags('role')
@ApiSecurity('x-api-key')
export class RoleController {
  constructor(private service: RoleService) {}

  @Get()
  @ApiQuery({ type: DTO.Role.GetManyRole })
  @ApiOperation({ summary: 'to get all role' })
  getMany(@Query() query: DTO.Role.GetManyRole) {
    return this.service.getManyRole(query)
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_ROLE)
  @ApiOperation({ summary: 'to create a role' })
  create(@Body() dto: DTO.Role.CreateRole) {
    return this.service.createRole(dto)
  }

  @Patch(':id')
  @DefineAction(Actions.EDIT_ROLE)
  @ApiOperation({ summary: 'to update a role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Role.UpdateRole,
  ) {
    return this.service.updateRole(id, dto)
  }

  @Delete(':id')
  @DefineAction(Actions.DELETE_ROLE)
  @ApiOperation({ summary: 'to delete a role' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeRole(id)
  }

  @Post(':id/default')
  @DefineAction(Actions.RESTORE_DEFAULT_ROLE)
  @ApiOperation({ summary: 'to restore default action for role' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.restoreDefault(id)
  }
}
