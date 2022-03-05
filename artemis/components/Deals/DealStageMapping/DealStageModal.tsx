import { yupResolver } from '@hookform/resolvers/yup'
import Loading from '@utils/components/Loading'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import {
  DealCategory,
  DealStageData,
  ForecastCategory,
} from '@utils/models/deal'
import { Task } from '@utils/models/task'
import { User } from '@utils/models/user'
import { Divider, Modal } from 'antd'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as yup from 'yup'
import { DealStageTable } from './DealStageTable'

const data: DealStageData[] = [
  {
    id: 'abc1',
    name: 'Qualification',
    probability: 32,
    dealCategory: DealCategory.CLOSED_LOST,
    forecastCategory: ForecastCategory.BEST_CASE,
  },
  {
    id: 'abc2',
    name: 'Needs Analysis',
    probability: 62,
    dealCategory: DealCategory.CLOSED_WON,
    forecastCategory: ForecastCategory.PIPELINE,
  },
  {
    id: 'abc3',
    name: 'Identify Decision Makers',
    probability: 62,
    dealCategory: DealCategory.OPEN,
    forecastCategory: ForecastCategory.OMMITED,
  },
]

export interface TaskFormData
  extends Pick<
    Task,
    'subject' | 'dueDate' | 'status' | 'priority' | 'description'
  > {
  ownerId: string
}

type Props = {
  visible: boolean
  handleClose?: () => void
  handleCreateTask?: (data: TaskFormData) => void
  isLoading: boolean
}

const taskSchema = yup.object().shape({
  ownerId: yup.string().required('Task Owner is required.'),
  subject: yup
    .string()
    .required('Subject is required.')
    .max(100, 'Subject must be at most 100 characters.'),
  status: yup.string().required('Status is required.'),
  priority: yup.string().required('Priority is required.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
})

export const DealStageModal = ({
  visible,
  handleClose,
  handleCreateTask,
  isLoading,
}: Props) => {
  const [session] = useTypedSession()

  const { data: taskOwners } = useQuery<User[]>(['users'], { enabled: false })

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      ownerId: '',
      description: '',
      dueDate: null,
    },
  })

  const createTask = handleSubmit(handleCreateTask!)

  const submitModal = () => {
    createTask()
    reset({ ownerId: session?.user.id })
  }

  const closeModal = () => {
    handleClose!()
    reset({ ownerId: session?.user.id })
  }

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  return (
    <Modal
      visible={visible}
      onCancel={closeModal}
      width={1000}
      maskClosable={false}
      footer={
        <div className="flex w-full gap-2 justify-end">
          <button
            onClick={submitModal}
            disabled={isLoading}
            className="crm-button"
          >
            <Loading on={isLoading}>Submit</Loading>
          </button>
          <button onClick={closeModal} className="crm-button-outline">
            Cancel
          </button>
        </div>
      }
    >
      <div className="flex gap-2 items-center">
        <div className="font-medium text-[17px]">Stage-Probability Mapping</div>
      </div>

      <Divider />

      <div className="max-h-[400px] overflow-y-auto overflow-x-hidden crm-scrollbar">
        <DealStageTable data={data} />
      </div>
    </Modal>
  )
}
