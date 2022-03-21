import { Table, TableColumnType } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useCallback } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { QueryClient, dehydrate, useQuery, useQueryClient } from 'react-query'

import Search from '@components/Tasks/Search'
import TasksSidebar from '@components/Tasks/Sidebar'
import TasksViewLayout from '@components/Tasks/TasksViewLayout'

import Paginate from '@utils/components/Paginate'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { formatDate } from '@utils/libs/time'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { getTasks } from '@utils/service/task'

export const taskColumns: TableColumnType<Task>[] = [
  {
    title: 'Subject',
    dataIndex: 'subject',
    key: 'subject',
    sorter: { compare: (a, b) => a.subject.localeCompare(b.subject) },
    fixed: 'left',
    render: (_, { id, subject }) => (
      <Link href={`/tasks/${id}`}>
        <a className="crm-link underline hover:underline">{subject}</a>
      </Link>
    ),
  },
  {
    title: 'Due Date',
    dataIndex: 'dueDate',
    key: 'dueDate',
    render: (_, { dueDate }) => formatDate(dueDate as Date),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    sorter: {
      compare: (a, b) => a.status.localeCompare(b.status),
    },
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    sorter: {
      compare: (a, b) =>
        Object.values(TaskPriority).indexOf(a.priority) -
        Object.values(TaskPriority).indexOf(b.priority),
    },
  },
  {
    title: 'Task Owner',
    dataIndex: 'owner',
    key: 'owner',
    sorter: {
      compare: (a, b) => a.owner.name.localeCompare(b.owner.name),
    },
    render: (_, { owner }) => owner.name,
  },
]

export default function TasksView() {
  const client = useQueryClient()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('search')
  const [status, setStatus] = useQueryState<Array<TaskStatus>>('status')
  const [priority, setPriority] = useQueryState<Array<TaskPriority>>('priority')

  const applySearch = (keyword: string | undefined) => {
    setPage(1)
    setSearch(keyword)
  }

  const applyFilter = useCallback(
    (
      status: TaskStatus[] | undefined,
      priority: TaskPriority[] | undefined,
    ) => {
      unstable_batchedUpdates(() => {
        setPage(1)
        status && setStatus(status)
        priority && setPriority(priority)
      })
    },
    [],
  )

  const { data: tasks, isLoading } = useQuery(
    [
      'tasks',
      page || 1,
      limit || 10,
      search || '',
      status || [],
      priority || [],
    ],
    getTasks({ limit, page, search, status, priority }),
    {
      keepPreviousData: true
    }
  )

  const [start, end, total] = usePaginateItem(tasks)

  return (
    <TasksViewLayout
      title="CRM | Tasks"
      sidebar={
        <TasksSidebar
          status={status}
          priority={priority}
          onFiltersChange={applyFilter}
        />
      }
    >
      <Search search={search} onSearchChange={applySearch} />

      <div className="mt-4">
        <AnimatePresence presenceAffectsLayout>
          {search && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-2"
            >
              Showing from {start} to {end} of {total} results.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col gap-4">
          <Table
            showSorterTooltip={false}
            columns={taskColumns}
            loading={isLoading}
            dataSource={tasks?.items}
            rowKey={(u) => u.id}
            rowSelection={{
              type: 'checkbox',
              onChange: (keys) =>
                client.setQueryData(
                  'selected-taskIds',
                  keys.map((k) => k.toString()),
                ),
            }}
            bordered
            pagination={false}
          />

          <Paginate
            containerClassName="self-end"
            pageSize={limit || 10}
            currentPage={page || 1}
            totalPage={tasks?.meta.totalPages}
            onPageChange={setPage}
            showJumpToHead
            showQuickJump
          />
        </div>
      </div>
    </TasksViewLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10
  const search = q.search as string | undefined
  const status = q.status as TaskStatus[] | undefined
  const priority = q.priority as TaskPriority[] | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['tasks', page, limit, search || '', status || [], priority || []],
        getTasks({ limit, page, search, status, priority }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}
