import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common'
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

  @Get(':id')
  @ApiOperation({ summary: 'to get one individually task' })
  getOneTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskById({
      where: { id },
      relations: ['owner', 'deal', 'contact', 'account', 'lead'],
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
}
