import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { lastValueFrom, map } from 'rxjs'
import { LeadContact, LeadSource, LeadStatus } from 'src/lead-contact/lead-contact.entity'
import { LeadService } from 'src/lead-contact/lead.service'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private leadService: LeadService,
    private httpService: HttpService
  ) { }

  async processNewLeadFromFacebook(leadId: string) {
    let response;
    const apiVersion = process.env.FACEBOOK_API_VERSION || "v12.0"
    let requestURL = `https://graph.facebook.com/${apiVersion}/${leadId}/?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`

    response = await lastValueFrom(
      this.httpService.get(requestURL).pipe(
        map((res) => {
          return res.data;
        }),
      ),
    );

    if (response.error || !response.field_data)
      throw new BadRequestException(`An invalid response was received from the Facebook API: ${response}`);

    let leadInfo: DTO.Lead.AddLead = new DTO.Lead.AddLead()
    for (const field of response.field_data) {
      let fileName:string= field.name
      fileName = fileName.toLowerCase()

      if(fileName == "email") leadInfo.email = field.values[0]
      if(fileName == "full_name") leadInfo.fullName = field.values[0]
      if(fileName == "phone") leadInfo.phoneNum = field.values[0]
      if(fileName == "street_address") leadInfo.address = field.values[0]
    }
    leadInfo.status = LeadStatus.NONE
    leadInfo.source = LeadSource.FACEBOOK
    
    return this.leadService.addLead(leadInfo)
  }
}