import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultEntity1650710485307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const deal = {
      id: 'ffd41308-6349-45c2-b0e8-761a3bb96732',
      name: 'deal',
      meta: [
        {
          name: 'ownerId',
          group: 'Deal Information',
          required: true,
          type: 'Relation',
          relateTo: 'user',
          relateType: 'SINGLE',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
          },
        },
        {
          name: 'accountId',
          group: 'Deal Information',
          required: true,
          type: 'Relation',
          relateTo: 'account',
          relateType: 'SINGLE',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'contactId',
          group: 'Deal Information',
          required: false,
          type: 'Relation',
          relateTo: 'contact',
          relateType: 'SINGLE',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'amount',
          group: 'Deal Information',
          required: false,
          type: 'Number',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'closingDate',
          group: 'Deal Information',
          required: true,
          type: 'Date',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'stageId',
          group: 'Deal Information',
          required: true,
          type: 'Relation',
          relateTo: 'dealstage',
          relateType: 'SINGLE',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'source',
          group: 'Deal Information',
          required: true,
          type: 'Select',
          options: ['None', 'Facebook', 'Let Tutor', 'Google'],
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'probability',
          group: 'Deal Information',
          required: false,
          type: 'Number',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'description',
          group: 'Description Information',
          required: false,
          type: 'Multiline Text',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
          maxLength: 300,
          minLength: 0,
        },
        {
          name: 'tasks',
          group: '',
          required: false,
          type: 'Relation',
          relateTo: 'task',
          relateType: 'MULTIPLE',
          visibility: {},
        },
      ],
    }

    const account = {
      id: 'aec15d92-8acb-4741-bb2e-3809fb715567',
      name: 'account',
      meta: [
        {
          name: 'ownerId',
          group: 'Account Information',
          required: true,
          type: 'Relation',
          relateTo: 'user',
          relateType: 'SINGLE',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'phone',
          group: 'Account Information',
          required: true,
          type: 'Phone',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'type',
          group: 'Account Information',
          required: true,
          type: 'Select',
          options: [
            'None',
            'Analyst',
            'Competitor',
            'Customer',
            'Distributor',
            'Integrator',
            'Investor',
            'Other',
            'Partner',
            'Press',
            'Prospect',
            'Reseller',
            'Vendor',
          ],
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'address',
          group: 'Address Information',
          required: false,
          type: 'Text',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
          maxLength: 100,
          minLength: 0,
        },
        {
          name: 'description',
          group: 'Description Information',
          required: false,
          type: 'Multiline Text',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
          maxLength: 300,
          minLength: 0,
        },
        {
          name: 'tasks',
          group: '',
          required: false,
          type: 'Relation',
          relateTo: 'task',
          relateType: 'MULTIPLE',
          visibility: {},
        },
      ],
    }

    const contact = {
      id: 'd35b4f28-16d1-4d02-981d-ca42fbe804ea',
      name: 'contact',
      meta: [
        {
          name: 'ownerId',
          group: 'Contact Information',
          required: true,
          type: 'Relation',
          relateType: 'SINGLE',
          relateTo: 'user',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'phone',
          group: 'Contact Information',
          required: true,
          type: 'Phone',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'email',
          group: 'Contact Information',
          required: true,
          type: 'Email',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'source',
          group: 'Contact Information',
          required: true,
          type: 'Select',
          options: ['None', 'Facebook', 'Let Tutor', 'Google'],
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'accountId',
          group: 'Contact Information',
          required: false,
          type: 'Relation',
          relateTo: 'account',
          relateType: 'SINGLE',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'address',
          group: 'Address Information',
          required: false,
          type: 'Multiline Text',
          visibility: {
            Create: true,
            Update: true,
            Detail: true,
          },
        },
        {
          name: 'description',
          group: 'Description Information',
          required: false,
          type: 'Multiline Text',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'tasks',
          group: '',
          required: false,
          type: 'Relation',
          relateTo: 'task',
          relateType: 'MULTIPLE',
          visibility: {},
        },
      ],
    }

    const lead = {
      id: '4c78ec63-6068-4db7-9d89-628f68c78b0e',
      name: 'lead',
      meta: [
        {
          name: 'ownerId',
          group: 'Lead Information',
          required: true,
          type: 'Relation',
          relateTo: 'user',
          relateType: 'SINGLE',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'phone',
          group: 'Lead Information',
          required: true,
          type: 'Phone',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'status',
          group: 'Lead Information',
          required: true,
          type: 'Select',
          options: [
            'None',
            'Attempted To Contact',
            'Contact In Future',
            'Contacted',
            'Junk Lead',
            'Lost Lead',
            'Not Contacted',
            'Pre Qualified',
            'Not Qualified',
          ],
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'email',
          group: 'Lead Information',
          required: true,
          type: 'Email',
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },
        {
          name: 'source',
          group: 'Lead Information',
          required: true,
          type: 'Select',
          options: ['None', 'Facebook', 'Let Tutor', 'Google'],
          visibility: {
            Overview: true,
            Update: true,
            Create: true,
            Detail: true,
          },
        },

        {
          name: 'address',
          group: 'Address Information',
          required: false,
          type: 'Text',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
          maxLength: 100,
          minLength: 0,
        },

        {
          name: 'description',
          group: 'Description Information',
          required: false,
          type: 'Multiple Text',
          visibility: {
            Update: true,
            Create: true,
            Detail: true,
          },
          maxLength: 300,
        },
        {
          name: 'tasks',
          group: '',
          required: false,
          type: 'Relation',
          relateTo: 'task',
          relateType: 'MULTIPLE',
          visibility: {},
        },
      ],
    }

    const query = `INSERT INTO "module"("id", "created_at", "updated_at", "name", "meta") 
              VALUES ('${deal.id}', DEFAULT, DEFAULT, '${
      deal.name
    }', '${JSON.stringify(deal.meta)}'),
                     ('${account.id}', DEFAULT, DEFAULT, '${
      account.name
    }', '${JSON.stringify(account.meta)}'),
                     ('${contact.id}', DEFAULT, DEFAULT, '${
      contact.name
    }', '${JSON.stringify(contact.meta)}'),
                     ('${lead.id}', DEFAULT, DEFAULT, '${
      lead.name
    }', '${JSON.stringify(lead.meta)}');`
    await queryRunner.query(query)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
