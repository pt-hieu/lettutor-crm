import { DealStageModal } from '@components/Deals/DealStageMapping/DealStageModal'
import React, { useState } from 'react'

const DealLayoutCustomPage = () => {
  // const [] = useState(true)
  return (
    <div>
      <DealStageModal visible={true} isLoading={false} />
    </div>
  )
}

export default DealLayoutCustomPage
