import { useRouter } from 'next/router'
import { SampleDeal } from 'pages/deals/[id]'

type Props = {
  deal: SampleDeal
}

const DealDetailNavbar = ({ deal: { id, name, amount } }: Props) => {
  const router = useRouter()

  const navigateToEditPage = () => {
    router.push(`/deals/${id}/edit`)
  }

  return (
    <div className="mb-4 border-b pb-4 sticky top-[76px] bg-white z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-semibold">{`${name}`}</span>
          <span className="mx-2">{`-`}</span>
          <span className="text-gray-500">{`$${amount}`}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button className="crm-button-secondary" onClick={navigateToEditPage}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default DealDetailNavbar
