import Animate from '@utils/components/Animate'
import ButtonAdd from '@utils/components/ButtonAdd'
import { menuItemClass } from '@utils/components/Header'
import Input from '@utils/components/Input'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { Actions } from '@utils/models/role'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  search: string | undefined
  onSearchChange: (v: string | undefined) => void
}

export default function Search({ onSearchChange: setSearch, search }: Props) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { search },
  })

  const submit = useCallback(
    handleSubmit(({ search }) => {
      setSearch(search)
    }),
    [],
  )

  const auth = useAuthorization()

  return (
    <div className="flex justify-between items-center p-1">
      <form onSubmit={submit} className="flex">
        <Input
          showError={false}
          props={{
            type: 'text',
            placeholder: 'Search by name',
            ...register('search'),
          }}
        />

        <button className="crm-button ml-4">Search</button>
        <Animate
          shouldAnimateOnExit
          transition={{ duration: 0.2 }}
          on={search}
          animation={{
            start: { opacity: 0 },
            animate: { opacity: 1 },
            end: { opacity: 0 },
          }}
          className="ml-2"
        >
          <button
            type="button"
            onClick={() => {
              reset({ search: '' })
              submit()
            }}
            className="crm-button-outline"
          >
            Clear
          </button>
        </Animate>
      </form>
      {auth[Actions.CREATE_NEW_ACCOUNT] && (
        <ButtonAdd title="Create Account" asLink link="/accounts/add-account" />
      )}
    </div>
  )
}
