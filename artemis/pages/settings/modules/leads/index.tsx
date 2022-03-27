import CustomizationLayout from '@utils/components/CustomizationLayout'

const LeadModuleCustomization = () => {
  const fieldStyte =
    'px-4 py-2 bg-white rounded flex justify-between items-center'

  return (
    <CustomizationLayout key="layout" requireLogin title={'Lead Customization'}>
      <div className="container grid grid-cols-[400px,1fr] min-h-[calc(100vh-140px)]">
        <div className="bg-blue-500 row-end-auto h-full">
          <div className="crm-container">
            <h2 className="text-white text-[17px] mb-5">New Fields</h2>
            <div>
              <div className="bg-white px-3 py-1 mb-3 rounded font-medium">
                Single Line
              </div>
              <div className="bg-white px-3 py-1 mb-3 rounded font-medium">
                Multiple Line
              </div>
              <div className="bg-white px-3 py-1 mb-3 rounded font-medium">
                Numeric
              </div>
              <div className="bg-white px-3 py-1 mb-3 rounded font-medium">
                Pick List
              </div>
              <div className="bg-white px-3 py-1 mb-3 rounded font-medium">
                Date
              </div>
              <div className="bg-white px-3 py-1 mb-3 rounded font-medium">
                Checkbox
              </div>
            </div>
            <div className="bg-white px-2 py-4 mb-3 rounded font-medium text-center mt-5">
              New Section
            </div>
          </div>
        </div>
        <div className="pl-20 pt-5 bg-gray-100">
          <h2 className="text-[20px] font-bold mb-10">Lead Customization</h2>
          <div className="section max-w-[1000px] border-2 border-gray-500 border-dotted p-3">
            <h2 className="text-[17px] font-semibold mb-4">Section Title</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={fieldStyte}>
                <div>Field Name</div>
                <div className="text-gray-400">Single Line</div>
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200">
                  <span className="fa fa-ellipsis-h" />
                </button>
              </div>
              <div className={fieldStyte}>
                <div>Field Name</div>
                <div className="text-gray-400">Single Line</div>
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200">
                  <span className="fa fa-ellipsis-h" />
                </button>
              </div>
              <div className={fieldStyte}>
                <div>Field Name</div>
                <div className="text-gray-400">Single Line</div>
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200">
                  <span className="fa fa-ellipsis-h" />
                </button>
              </div>
              <div className={fieldStyte}>
                <div>Field Name</div>
                <div className="text-gray-400">Single Line</div>
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200">
                  <span className="fa fa-ellipsis-h" />
                </button>
              </div>
              <div className={fieldStyte}>
                <div>Field Name</div>
                <div className="text-gray-400">Single Line</div>
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200">
                  <span className="fa fa-ellipsis-h" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomizationLayout>
  )
}

export default LeadModuleCustomization
