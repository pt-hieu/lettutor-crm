import { useEffect } from 'react'
import { useQueryClient } from 'react-query'

import { FieldMeta, FieldType } from '@utils/models/module'
import { getRawDealStage } from '@utils/service/deal'
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
      if (name === 'user') {
        getRawUsers()().then(setData(name))
        return
      }

      if (name === 'dealstage') {
        getRawDealStage().then(setData(name))
        return
      }

      getRawEntity(name)().then(setData(name))
    })
  }, [meta])
}
