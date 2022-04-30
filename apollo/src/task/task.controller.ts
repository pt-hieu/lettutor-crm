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

import { TaskService } from './task.service'

@ApiTags('task')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
@Controller('task')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get('raw')
  @ApiOperation({ summary: 'to view raw all tasks' })
  getManyRaw() {
    return this.service.getManyRaw()
  }

  @Get()
  @ApiOperation({ summary: 'to view, search and filter all tasks' })
  index(@Query() query: DTO.Task.GetManyQuery) {
    return this.service.getMany(query)
  }

  @Post()
  @DefineAction({
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_CREATE_NEW,
  })
  @ApiOperation({ summary: 'to add new task' })
  addTask(@Body() dto: DTO.Task.AddTask) {
    return this.service.addTask(dto)
  }

  @Get('entity/:id')
  @ApiOperation({ summary: 'to get task of an entity' })
  getTaskOfEntity(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskOfEntity(id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get task information by Id' })
  getTaskById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskById({
      where: { id },
      relations: ['owner'],
    })
  }

  @Get(':id/relations')
  @ApiOperation({ summary: 'to get task relation' })
  getTaskRelation(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskRelation(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'to edit a task' })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Task.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }

  @Delete('batch')
  @DefineAction({
    target: DefaultActionTarget.TASK,
    type: ActionType.CAN_DELETE_ANY,
  })
  @ApiOperation({ summary: 'to batch delete tasks' })
  deleteNote(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
