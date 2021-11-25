import Input from '@utils/components/Input'
import { Role } from '@utils/models/user'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  query: string
  role: Role | ''
}

interface Props {
  onQueryChange: (query: string) => void
  onRoleChange: (role: Role | '') => void
  query: string
  role: Role | ''
}

export default function Search({
  onQueryChange: changeQuery,
  onRoleChange: changeRole,
  query,
  role: initRole,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ defaultValues: { role: initRole, query } })

  const role = watch('role')

  const search = useCallback(
    handleSubmit(({ query, role }) => {
      changeQuery(query)
      changeRole(role)
    }),
    [],
  )

  useEffect(() => {
    changeRole(role)
  }, [role])

  return (
    <div>
      <form onSubmit={search} className="flex gap-2">
        <div className="relative">
          <Input
            error={errors.query?.message}
            props={{
              type: 'text',
              className: 'pr-10',
              placeholder: 'Search user by name',
              ...register('query'),
            }}
          />
          <button className="absolute text-gray-600 right-4 top-[10px]">
            <span className="fa fa-search" />
          </button>
        </div>
        <Input
          error={errors.query?.message}
          as="select"
          props={{
            ...register('role'),
            children: (
              <>
                <option value={''}>Select a role</option>
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </>
            ),
          }}
        />
      </form>
    </div>
  )
}
