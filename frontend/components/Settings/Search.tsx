import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import { Role, UserStatus } from '@utils/models/user'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'

type FormData = {
  query?: string
  role?: Role
  status?: UserStatus
}

interface Props {
  onQueryChange: (query: string | undefined) => void
  onRoleChange: (role: Role | undefined) => void
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
    handleSubmit(({ query, role, status }) => {
      changeQuery(query || undefined)
      changeRole(role || undefined)
      changeStatus(status || undefined)

      if (!query && !status && !role) setSubmitted(false)
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
          error={undefined}
          showError={false}
          as="select"
          props={{
            ...register('role'),
            children: (
              <>
                <option value={''}>Role</option>
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </>
            ),
          }}
        />

        <Input
          error={undefined}
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
