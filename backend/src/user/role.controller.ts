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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { UserService } from './user.service'

@Controller('role')
@ApiTags('role')
@ApiBearerAuth('jwt')
export class RoleController {
  constructor(private service: UserService) { }

  @Get()
  @ApiQuery({ type: DTO.Role.GetManyRole })
  @ApiOperation({ summary: 'to get all role' })
  getMany(@Query() query: DTO.Role.GetManyRole) {
    return this.service.getManyRole(query)
  }

  @Post()
  @ApiOperation({ summary: 'to create a role' })
  create(@Body() dto: DTO.Role.CreateRole) {
    return this.service.createRole(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to update a role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Role.UpdateRole,
  ) {
    return this.service.updateRole(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'to delete a role' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeRole(id)
  }
}
