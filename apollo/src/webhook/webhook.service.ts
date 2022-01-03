import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { lastValueFrom, map, tap } from 'rxjs'
import { Lead, LeadSource, LeadStatus } from 'src/lead/lead.entity'
import { LeadService } from 'src/lead/lead.service'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'

const ApiVersion = process.env.FACEBOOK_API_VERSION || 'v12.0'

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    private leadService: LeadService,
    private httpService: HttpService,
  ) {}

  async processNewLeadFromFacebook(leadId?: string) {
    if (!leadId) throw new BadRequestException('Invalid POST data received')

    const requestURL = `https://graph.facebook.com/${ApiVersion}/${leadId}/?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`
    const response = await lastValueFrom(
      this.httpService.get(requestURL).pipe(map((res) => res.data)),
    )

    if (response.error || !response.field_data)
      throw new BadRequestException(
        `An invalid response was received from the Facebook API: ${response}`,
      )

    const fieldMapping: Record<string, keyof DTO.Lead.AddLead> = {
      email: 'email',
      full_name: 'fullName',
      phone: 'phoneNum',
      street_address: 'address',
    }

    const leadInfo: DTO.Lead.AddLead = new DTO.Lead.AddLead()

    ;(response.field_data as { name: string; values: string[] }[]).forEach(
      (field) => {
        ;(leadInfo[fieldMapping[field.name.toLocaleLowerCase()]] as string) =
          field.values[0]
      },
    )

    leadInfo.status = LeadStatus.NONE
    leadInfo.source = LeadSource.FACEBOOK

    return this.leadService.addLead(leadInfo)
  }

  async processStrapiBugCall(dto: DTO.Strapi.Bug) {
    if (dto.event !== 'entry.create') return
    if (dto.model !== 'bug') return

    const data = {
      title: dto.entry.subject,
      body: dto.entry.description,
      assignees: ['pt-hieu'],
    }

    const url = 'https://api.github.com/repos/pt-hieu/lettutor-crm/issues'
    this.httpService
      .post(url, data, {
        headers: {
          Authorization: 'token ' + process.env.GH_TOKEN,
        },
      })
      .pipe(map((res) => res.data))
  }
}
