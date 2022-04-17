import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { DTO } from 'src/type'

import { ModuleService } from './module.service'

@Controller('module')
@ApiTags('module')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class ModuleController {
  constructor(private service: ModuleService) {}

  @Get()
  @ApiOperation({ summary: 'to get many modules' })
  getModule() {
    return this.service.getManyModule()
  }

  @Post()
  @ApiOperation({ summary: 'to create module' })
  createModule(@Body() dto: DTO.Module.CreateModule) {
    return this.service.createModule(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to update module' })
  updateModule(
    @Body() dto: DTO.Module.UpdateModule,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.updateModule(id, dto)
  }

  @Get('/entity/raw/create-task')
  @ApiOperation({ summary: 'to get raw entity for creating task' })
  getRawEntityForCreatingTask() {
    return this.service.getRawEntityForTaskCreate()
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

  @Post('lead/:id/convert')
  @ApiOperation({ summary: 'to convert lead to account, contact and lead' })
  @ApiBody({ required: false, type: DTO.Module.ConvertToDeal })
  async convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: object,
    @Query('ownerId', new DefaultValuePipe(undefined), ParseUUIDPipe)
    ownerId?: string,
  ) {
    const shouldConvertToDeal = Object.keys(body).length !== 0
    let dto: DTO.Module.ConvertToDeal

    if (shouldConvertToDeal) {
      dto = plainToInstance(DTO.Module.ConvertToDeal, body, {
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
