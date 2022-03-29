import { useEffect } from 'react'
import { useQueryClient } from 'react-query'

import { FieldMeta, FieldType } from '@utils/models/module'
import { getRawAccounts } from '@utils/service/account'
import { getRawContacts } from '@utils/service/contact'
import { getRawDealStage, getRawDeals } from '@utils/service/deal'
import { getRawEntity } from '@utils/service/module'
import { getRawUsers } from '@utils/service/user'

export function useRelationField(meta: FieldMeta[] | null) {
  const client = useQueryClient()

  useEffect(() => {
    const relationNames = new Set(
      meta
        ?.filter(
          (field) => !!field.relateTo && field.type === FieldType.RELATION,
        )
        .map((field) => field.relateTo!) || [],
    )

    const setData = (name: string) => (data: any) => {
      client.setQueryData(['relation-data', name], data)
    }

    relationNames.forEach((name) => {
      if (name === 'User') {
        getRawUsers()().then(setData(name))
      }

      if (name === 'Account') {
        getRawEntity('account')().then(setData(name))
      }

      if (name === 'Contact') {
        getRawEntity('contact')().then(setData(name))
      }

      if (name === 'Deal') {
        getRawEntity('deal')().then(setData(name))
      }

      if (name === 'DealStage') {
        getRawDealStage().then(setData(name))
      }
    })
  }, [])
}
