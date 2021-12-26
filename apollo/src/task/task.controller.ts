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
import { DTO } from 'src/type'
import { Payload } from 'src/utils/decorators/payload.decorator'
import { JwtPayload } from 'src/utils/interface'
import { TaskService } from './task.service'

@ApiTags('task')
@ApiBearerAuth('jwt')
@Controller('task')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'view, search and filter all leads' })
  index(@Query() query: DTO.Task.GetManyQuery, @Payload() payload: JwtPayload) {
    return this.service.getMany(query, payload)
  }

  @Post()
  @ApiOperation({ summary: 'to add new task' })
  addTask(@Body() dto: DTO.Task.AddTask) {
    return this.service.addTask(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'to get lead information by Id' })
  getTaskById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTaskById({
      where: { id },
      relations: ['owner', 'account', 'lead', 'contact', 'deal'],
    })
  }

  //@ApiOperation({ summary: 'to get one individually task' })
  //getOneTask(@Param('id', ParseUUIDPipe) id: string) {
  //return this.service.getTaskById({
  //where: { id },
  //relations: ['owner', 'deal', 'contact', 'account', 'lead'],
  //})
  //}

  @Patch(':id')
  @ApiOperation({ summary: 'to edit a task' })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DTO.Task.UpdateBody,
  ) {
    return this.service.update(id, dto)
  }
}
