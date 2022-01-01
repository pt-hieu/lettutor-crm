import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DefineAction } from 'src/action.decorator'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { JwtPayload } from 'src/utils/interface'
import { TaskService } from './task.service'

@ApiTags('task')
@ApiBearerAuth('jwt')
@Controller('task')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get()
  @DefineAction(Actions.VIEW_ALL_TASKS)
  @ApiOperation({ summary: 'view, search and filter all tasks' })
  index(@Query() query: DTO.Task.GetManyQuery, @Payload() payload: JwtPayload) {
    return this.service.getMany(query, payload)
  }

  @Post()
  @DefineAction(Actions.CREATE_NEW_TASK)
  @ApiOperation({ summary: 'to add new task' })
  addTask(@Body() dto: DTO.Task.AddTask) {
    return this.service.addTask(dto)
  }

  @Get(':id')
  @DefineAction(Actions.VIEW_ALL_TASK_DETAILS)
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_TASK_DETAILS)
  @ApiOperation({ summary: 'to get task information by Id' })
  getTaskById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskById({
      where: { id },
      relations: ['owner', 'account', 'lead', 'contact', 'deal'],
    })
  }

  @Patch(':id')
  @DefineAction(Actions.VIEW_AND_EDIT_ALL_TASK_DETAILS)
  @ApiOperation({ summary: 'to edit a task' })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Task.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }
}
