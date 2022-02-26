import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Post,
  Delete,
} from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
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
  @DefineAction(Actions.CREATE_NEW_TASK)
  @ApiOperation({ summary: 'to add new task' })
  addTask(@Body() dto: DTO.Task.AddTask) {
    return this.service.addTask(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get task information by Id' })
  getTaskById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskById({
      where: { id },
      relations: ['owner', 'account', 'lead', 'contact', 'deal'],
    })
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
  @ApiOperation({ summary: 'to batch delete tasks' })
  deleteNote(@Body() dto: DTO.BatchDelete) {
    return this.service.batchDelete(dto.ids)
  }
}
