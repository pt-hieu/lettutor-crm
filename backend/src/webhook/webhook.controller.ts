import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "src/utils/decorators/public.decorator";

@ApiTags('webhook')
@ApiBearerAuth('jwt')
@Controller('webhook')
export class WebhookController {
  @Get()
  @ApiOperation({ summary: '' })
  @Public()
  verify(@Query() query: any) {
    if (query['hub.mode'] !== 'subscribe')
      throw new BadRequestException('Invalid mode');
    if (query['hub.verify_token'] !== process.env.FACEBOOK_PAGE_VERIFY_TOKEN)
      throw new BadRequestException('Invalid verify token');
    return query['hub.challenge']
  }

}


