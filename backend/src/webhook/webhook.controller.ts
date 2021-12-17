import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
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
  @ApiOperation({ summary: 'to verify webhook callback_url' })
  @Public()
  verify(@Query() query: any) {
    if (query['hub.mode'] !== 'subscribe')
      throw new BadRequestException('Invalid mode');
    if (query['hub.verify_token'] !== process.env.FACEBOOK_PAGE_VERIFY_TOKEN)
      throw new BadRequestException('Invalid verify token');
    return query['hub.challenge']
  }

  @Post()
  @ApiOperation({ summary: 'to submit lead from Facebook' })
  @Public()
  async listenForLead(@Body() body: any) {
    if (!body.entry || !body.entry[0])
      throw new BadRequestException('Invalid POST data received');
    const entry = body.entry[0]

    for (const change of entry.changes) {
      if (!change.value || !change.value.leadgen_id)
        throw new BadRequestException('Invalid POST data received');
      await this.service.processNewLeadFromFacebook(change.value.leadgen_id);
    }

    return 1
  }
}
