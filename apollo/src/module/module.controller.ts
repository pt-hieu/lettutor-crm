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

import { ModuleService } from './module.service'

@Controller()
@ApiTags('module')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class ModuleController {
  constructor(private service: ModuleService) {}

  @Get('module')
  @ApiOperation({ summary: 'to get many modules' })
  getModule() {
    return this.service.getManyModule()
  }

  @Post('module')
  @ApiOperation({ summary: 'to create module' })
  createModule(@Body() dto: DTO.Module.CreateModule) {
    return this.service.createModule(dto)
  }

  @Patch('module/:id')
  @ApiOperation({ summary: 'to update module' })
  updateModule(
    @Body() dto: DTO.Module.UpdateModule,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.updateModule(id, dto)
  }

  @Get(':name/raw')
  @ApiOperation({ summary: 'to get many raw entity' })
  getRawEntity(@Param('name') moduleName: string) {
    return this.service.getRawEntity(moduleName)
  }

  @Get(':name')
  @ApiOperation({ summary: 'to get many entity' })
  getManyEntity(
    @Query() query: DTO.Module.GetManyEntity,
    @Param('name') moduleName: string,
  ) {
    return this.service.getManyEntity(moduleName, query)
  }

  @Post(':name')
  @ApiOperation({ summary: 'to create entity at module' })
  createEntity(
    @Param('name') moduleName: string,
    @Body() dto: DTO.Module.AddEntity,
  ) {
    return this.service.addEntity(moduleName, dto)
  }

  @Get(':name/:id')
  @ApiOperation({ summary: 'to get one entity at module' })
  getOneEntity(
    @Param('id', ParseUUIDPipe) entityId: string,
    @Param('name') moduleName: string,
  ) {
    return this.service.getOneEntity(moduleName, entityId)
  }

  @Patch(':name/:id')
  @ApiOperation({ summary: 'to update entity at module' })
  updateEntity(
    @Param('id', ParseUUIDPipe) entityId: string,
    @Param('name') _moduleName: string,
    @Body() dto: DTO.Module.UpdateEnity,
  ) {
    return this.service.updateEntity(entityId, dto)
  }

  @Delete('entity/batch')
  @ApiOperation({ summary: 'to batch delete entity' })
  batchDelete(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDeleteEntity(dto)
  }
}
