import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { TaskService } from './task.service'

@ApiTags('task')
@ApiBearerAuth('jwt')
@Controller('task')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'to add new task' })
  addTask(@Body() dto: DTO.Task.AddTask) {
    return this.service.addTask(dto)
  }
}
