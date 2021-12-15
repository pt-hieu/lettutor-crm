import { HttpService } from "@nestjs/axios";
import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { lastValueFrom, map, tap } from "rxjs";
import { Public } from "src/utils/decorators/public.decorator";
import { WebhookService } from "./webhook.service";

@ApiTags('webhook')
@ApiBearerAuth('jwt')
@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly service: WebhookService,
  ) { }

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

  @Post()
  @ApiOperation({ summary: '' })
  @Public()
  async listenForLead(@Body() body: any) {
    if (!body.entry)
      throw new BadRequestException('Invalid POST data received');
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        await this.service.processNewLeadFromFacebook(change.value.leadgen_id);
      }
    }
    return 1
  }
}
