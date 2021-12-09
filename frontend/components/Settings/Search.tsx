import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import { UserStatus } from '@utils/models/user'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from 'react-query'
import { Role } from '@utils/models/role'

type FormData = {
  query?: string
  role?: string
  status?: UserStatus
}

interface Props {
  onQueryChange: (query: string | undefined) => void
  onRoleChange: (role: string | undefined) => void
  onStatusChange: (status: UserStatus | undefined) => void
  loading: boolean
}

export default function Search({
  onQueryChange: changeQuery,
  onRoleChange: changeRole,
  onStatusChange: changeStatus,
  loading,
}: Props) {
  const { query } = useRouter()
  const { data: roles } = useQuery<Role[]>('roles', { enabled: false })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: query,
  })

  const [submitted, setSubmitted] = useState(false)

  const search = useCallback(
    handleSubmit(({ query, status, role }) => {
      changeQuery(query || undefined)
      changeRole(role || undefined)
      changeStatus(status || undefined)

      if (!query && !status) setSubmitted(false)
      else setSubmitted(true)
    }),
    [],
  )

  const clear = useCallback(() => {
    reset()
    search()

    setTimeout(() => {
      setSubmitted(false)
    }, 0)
  }, [])

  return (
    <div>
      <form onSubmit={search} className="flex gap-2">
        <Input
          error={errors.query?.message}
          props={{
            type: 'text',
            className: 'pr-10',
            placeholder: 'Search user by name',
            ...register('query'),
          }}
        />

        <Input
          showError={false}
          as="select"
          props={{
            ...register('role'),
            children: (
              <>
                <option value={''}>Role</option>
                {roles?.map(({ id, name }) => (
                  <option key={id} value={name}>
                    {name}
                  </option>
                ))}
              </>
            ),
          }}
        />

        <Input
          showError={false}
          as="select"
          props={{
            ...register('status'),
            children: (
              <>
                <option value={''}>Status</option>
                {Object.values(UserStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </>
            ),
          }}
        />

        <button disabled={loading} className="crm-button w-20">
          <Loading on={loading}>
            <span className="fa fa-search" />
          </Loading>
        </button>

        <AnimatePresence exitBeforeEnter>
          {submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                disabled={loading}
                type="button"
                onClick={clear}
                className="crm-button-outline w-20"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
