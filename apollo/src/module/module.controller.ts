import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Response,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Response as Res } from 'express'

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

  @Get('/entity/report')
  @ApiOperation({ summary: 'to get deal and lead related report' })
  getDealReport(@Query() dto: DTO.Module.ReportFilter) {
    return this.service.getReport(dto)
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

  @Get(':name/csv')
  @ApiOperation({ summary: 'to get the csv template for creating module' })
  async getCreateLeadTemplate(
    @Param('name') moduleName: string,
    @Response({ passthrough: true }) res: Res,
  ) {
    const csv = await this.service.getTemplateForCreatingModuule(moduleName)

    res.set('Content-Type', 'text/csv')
    res.attachment('template.csv').send(csv)
  }

  @Get(':name/export/csv')
  @ApiOperation({ summary: 'to get list entities of a specific module' })
  async exportEntities(
    @Param('name') moduleName: string,
    @Response({ passthrough: true }) res: Res,
  ) {
    const csv = await this.service.getListInCsvFormat(moduleName)
    const fileName = moduleName + '.csv'

    res.set('Content-Type', 'text/csv')
    res.attachment(fileName).send(csv)
  }

  @Post(':name/import/csv')
  @ApiOperation({ summary: 'to import entities at module via uploading csv/xlsx' })
  importEntities(
    @Body() dto: DTO.File.Files,
    @Param('name') moduleName: string,
  ) {
    return this.service.bulkCreateEntities(moduleName, dto)
  }

  @Put('convert/:source_id')
  @ApiOperation({ summary: 'to convert entity' })
  convert(
    @Body() dto: DTO.Module.BatchConvert[],
    @Param('source_id', ParseUUIDPipe) sourceId: string,
  ) {
    return this.service.batchConvert(Object.values(dto), sourceId)
  }

  @Get(':source_name/convertable_modules')
  @ApiOperation({
    summary: 'to get modules which can be converted from the source module',
  })
  getConvertableModules(@Param('source_name') sourceModuleName: string) {
    return this.service.getConvertableModules(sourceModuleName)
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
