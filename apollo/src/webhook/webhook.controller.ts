import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DTO } from 'src/type'
import { Public } from 'src/utils/decorators/public.decorator'
import { WebhookService } from './webhook.service'

@ApiTags('webhook')
@ApiBearerAuth('jwt')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Get()
  @ApiOperation({ summary: 'for faceboook to verify webhook callback_url' })
  @Public()
  verify(@Query() query: any) {
    if (query['hub.mode'] !== 'subscribe')
      throw new BadRequestException('Invalid mode')
    if (query['hub.verify_token'] !== process.env.FACEBOOK_PAGE_VERIFY_TOKEN)
      throw new BadRequestException('Invalid verify token')
    return query['hub.challenge']
  }

  @Post()
  @ApiOperation({ summary: 'for facebook to submit lead info' })
  @Public()
  async listenForLead(
    @Body()
    body: {
      entry: { changes: { value?: { leadgen_id?: string } }[] }[]
    },
  ) {
    if (!body.entry || !body.entry[0])
      throw new BadRequestException('Invalid POST data received')

    const entry = body.entry[0]
    await Promise.allSettled(
      entry.changes.map((change) =>
        this.service.processNewLeadFromFacebook(change.value?.leadgen_id),
      ),
    )

    return 1
  }

  @Post('strapi')
  @Public()
  @ApiOperation({ summary: 'for strapi to submit bug' })
  handleStrapiCall(@Body() dto: DTO.Strapi.Bug) {
    return this.service.processStrapiBugCall(dto)
  }
}
