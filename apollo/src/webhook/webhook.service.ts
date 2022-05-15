import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'

import { LeadSource, LeadStatus, ModuleName } from 'src/module/default.entity'
import { ModuleService } from 'src/module/module.service'
import { DTO } from 'src/type'

const ApiVersion = process.env.FACEBOOK_API_VERSION || 'v12.0'

@Injectable()
export class WebhookService {
  constructor(
    private moduleService: ModuleService,
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
    //start here
    const fieldMapping: Record<string, string> = {
      email: 'email',
      full_name: 'name',
      phone: 'phone',
      street_address: 'address',
    }

    const leadInfo: DTO.Module.AddEntity = new DTO.Module.AddEntity()

    ;(response.field_data as { name: string; values: string[] }[]).forEach(
      (field) => {
        field.name.toLocaleLowerCase() === 'full_name'
          ? ((leadInfo[
              fieldMapping[field.name.toLocaleLowerCase()]
            ] as string) = field.values[0])
          : ((leadInfo['data'][
              fieldMapping[field.name.toLocaleLowerCase()]
            ] as string) = field.values[0])
      },
    )

    leadInfo['status'] = LeadStatus.NONE
    leadInfo['source'] = LeadSource.FACEBOOK

    return this.moduleService.addEntity(ModuleName.LEAD, leadInfo)
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
