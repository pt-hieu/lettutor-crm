import { Tabs, notification } from 'antd'
import { useRouter } from 'next/router'
import React, { createContext, useState } from 'react'
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd'

import { toCapitalizedWords } from '@components/Module/OverviewView'
import { TFieldData } from '@components/Settings/Customization/Field'
import { SEPERATOR, Section } from '@components/Settings/Customization/Section'
import {
  Sidebar,
  TSection,
  TSectionData,
  pureFields,
  pureSection,
} from '@components/Settings/Customization/Sidebar'

import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { ActionType } from '@utils/models/customization'
import { FieldType } from '@utils/models/module'

const { TabPane } = Tabs

const initialFields: Record<string, TFieldData> = {
  'field-1': {
    id: 'field-1',
    name: 'Mobile Phone',
    required: false,
    type: FieldType.PHONE,
    visibility: {},
  },
  'field-2': {
    id: 'field-2',
    name: 'Email',
    required: true,
    type: FieldType.EMAIL,
    visibility: {},
  },
  'field-3': {
    id: 'field-3',
    name: 'Name',
    required: false,
    type: FieldType.SELECT,
    visibility: {},
  },
  'field-4': {
    id: 'field-4',
    name: 'Date',
    required: false,
    type: FieldType.DATE,
    visibility: {},
    isCustomField: true,
  },
}

const initialData = {
  sections: {
    'section-1': {
      id: 'section-1',
      name: 'To do',
      fieldIds1: ['field-1', 'field-2', 'field-3', 'field-4'],
      fieldIds2: [],
    },
    'section-2': {
      id: 'section-2',
      name: 'In progress',
      fieldIds1: [],
      fieldIds2: [],
    },
    'section-3': {
      id: 'section-3',
      name: 'Done',
      fieldIds1: [],
      fieldIds2: [],
    },
    'section-4': {
      id: 'section-4',
      name: 'Review',
      fieldIds1: [],
      fieldIds2: [],
    },
  },

  sectionOrder: ['section-1', 'section-2', 'section-3', 'section-4'],
}

type TFieldContext = {
  onUpdate: (id: string, data: Partial<TFieldData>) => void
  onDelete: (id: string) => void
  activeField: string | null
  setActiveField: (value: string | null) => void
}

export const FieldsContext = createContext<TFieldContext | null>(null)

interface Props {
  moduleName: 'lead' | 'contact' | 'account' | 'deal'
}

export const CustomPage = ({ moduleName }: Props) => {
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    initialData.sectionOrder,
  )
  const [sections, setSections] = useState<Record<string, TSectionData>>(
    initialData.sections,
  )

  const [fields, setFields] = useState(initialFields)
  const [activeField, setActiveField] = useState<null | string>(null)

  const { push } = useRouter()

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result
    if (!destination) return

    const sourceId = source.droppableId
    const destinationId = destination.droppableId

    if (destinationId === sourceId && destination.index === source.index) return

    //Moving sections
    if (type === 'section' && sourceId !== 'new-section') {
      const newColumnOrder = [...sectionOrder]
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)

      setSectionOrder(newColumnOrder)
      return
    }

    const [sourceSection, sourceColumn] = sourceId.split(SEPERATOR)
    const [destinationSection, destinationColumn] =
      destinationId.split(SEPERATOR)

    const start = sections[sourceSection]
    const finish = sections[destinationSection]

    //Add new field
    if (sourceId === 'new-field') {
      const newFieldId = new Date().toISOString() + Math.random()

      const newField: TFieldData = {
        ...pureFields[draggableId as FieldType],
        id: newFieldId,
        action: ActionType.ADD,
        isCustomField: true,
      }
      setFields({ ...fields, [newFieldId]: newField })
      setActiveField(newFieldId)

      const finishFieldIds = [
        ...finish[`fieldIds${destinationColumn}` as keyof TSection],
      ]

      finishFieldIds.splice(destination.index, 0, newFieldId)
      const newFinish: TSection = {
        ...finish,
        [`fieldIds${destinationColumn}` as keyof TSection]: finishFieldIds,
      }

      setSections({
        ...sections,
        [newFinish.id]: newFinish,
      })
      return
    }

    //Add new section
    if (sourceId === 'new-section') {
      const newSectionId = new Date().toISOString() + Math.random()

      const newSection: TSectionData = {
        ...pureSection,
        id: newSectionId,
        action: ActionType.ADD,
      }

      setSections({ ...sections, [newSectionId]: newSection })

      const newSectionOrder = [...sectionOrder]
      newSectionOrder.splice(destination.index, 0, newSectionId)

      setSectionOrder(newSectionOrder)

      return
    }

    // Moving field In the same column
    if (sourceId === destinationId) {
      const newFieldIds = [
        ...start[`fieldIds${sourceColumn}` as keyof TSection],
      ]

      newFieldIds.splice(source.index, 1)
      newFieldIds.splice(destination.index, 0, draggableId)

      const newSection: TSection = {
        ...start,
        [`fieldIds${sourceColumn}` as keyof TSection]: newFieldIds,
      }

      setSections({ ...sections, [newSection.id]: newSection })
      return
    }

    //Moving field In the same section
    if (sourceSection === destinationSection) {
      const startFieldIds = [
        ...start[`fieldIds${sourceColumn}` as keyof TSection],
      ]
      startFieldIds.splice(source.index, 1)

      const finishFieldIds = [
        ...finish[`fieldIds${destinationColumn}` as keyof TSection],
      ]
      finishFieldIds.splice(destination.index, 0, draggableId)

      const newSection: TSection = {
        ...sections[sourceSection],
        [`fieldIds${sourceColumn}` as keyof TSection]: startFieldIds,
        [`fieldIds${destinationColumn}` as keyof TSection]: finishFieldIds,
      }

      setSections({
        ...sections,
        [newSection.id]: newSection,
      })
      return
    }

    //Moving field from another section
    const startFieldIds = [
      ...start[`fieldIds${sourceColumn}` as keyof TSection],
    ]
    startFieldIds.splice(source.index, 1)

    const newStart: TSection = {
      ...start,
      [`fieldIds${sourceColumn}` as keyof TSection]: startFieldIds,
    }

    const finishFieldIds = [
      ...finish[`fieldIds${destinationColumn}` as keyof TSection],
    ]
    finishFieldIds.splice(destination.index, 0, draggableId)
    const newFinish: TSection = {
      ...finish,
      [`fieldIds${destinationColumn}` as keyof TSection]: finishFieldIds,
    }

    setSections({
      ...sections,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    })
  }

  const handleDeleteSection = (id: string) => {
    const newSections = { ...sections }
    newSections[id].action = ActionType.DELETE
    setSections(newSections)
  }

  const handleRenameSection = (id: string, name: string) => {
    const newSections = { ...sections }
    newSections[id].name = name
    setSections(newSections)
  }

  const handleDeleteField = (id: string) => {
    const field: TFieldData = { ...fields[id], action: ActionType.DELETE }
    setFields({ ...fields, [id]: field })
  }

  const handleUpdateField = (id: string, data: Partial<TFieldData>) => {
    const field: TFieldData = { ...fields[id], ...data }
    if (field.action !== ActionType.ADD) {
      field.action === ActionType.UPDATE
    }
    setFields({ ...fields, [id]: field })
  }

  const handleBack = () => push('/settings/modules')

  const handleSave = () => {}

  return (
    <Layout
      requireLogin
      title={`${toCapitalizedWords(moduleName)} | Customization`}
      header={false}
      footer={false}
    >
      <div className="grid grid-cols-[340px,1fr] grid-rows-[60px,1fr] h-screen overflow-hidden">
        <div className="col-span-2 border-b flex justify-between items-center px-4">
          <div className="text-[20px]">
            <button
              className="crm-button-icon w-8 aspect-square text-gray-600 hover:text-gray-500"
              title="Back to layout list"
              onClick={handleBack}
            >
              <span className="fa fa-long-arrow-left mr-2"></span>
            </button>
            <span className="capitalize">{moduleName}</span>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="crm-button-outline"
              onClick={handleBack}
            >
              <span className="fa fa-times mr-2" />
              Cancel
            </button>

            <button className="crm-button" onClick={handleSave}>
              <Loading on={false}>
                <span className="fa fa-check mr-2" />
                Save
              </Loading>
            </button>
          </div>
        </div>
        <FieldsContext.Provider
          value={{
            onDelete: handleDeleteField,
            onUpdate: handleUpdateField,
            activeField,
            setActiveField,
          }}
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Sidebar />
            <div className="px-[64px] overflow-hidden grid grid-rows-[60px,1fr] pb-4">
              <Tabs defaultActiveKey="1">
                <TabPane tab={<span>CREATE VIEW</span>} key="1"></TabPane>
                <TabPane tab={<span>DETAIL VIEW</span>} key="2"></TabPane>
              </Tabs>
              <div className="overflow-y-scroll pr-[60px]">
                <Droppable droppableId="all-sections" type="section">
                  {({ droppableProps, innerRef, placeholder }) => (
                    <div
                      ref={innerRef}
                      {...droppableProps}
                      className="h-full flex flex-col gap-4 pt-2"
                    >
                      {sectionOrder.map((sectionId, index) => {
                        const section = sections[sectionId]

                        if (section.action === ActionType.DELETE) return null

                        const mapFields1 = section.fieldIds1
                          .map(
                            (fieldId) => fields[fieldId as keyof typeof fields],
                          )
                          .filter((item) => item.action !== ActionType.DELETE)

                        const mapFields2 = section.fieldIds2
                          .map(
                            (fieldId) => fields[fieldId as keyof typeof fields],
                          )
                          .filter((item) => item.action !== ActionType.DELETE)

                        return (
                          <Section
                            onDelete={handleDeleteSection}
                            onRename={handleRenameSection}
                            name={section.name}
                            key={section.id}
                            id={section.id}
                            fieldsColumn1={mapFields1}
                            fieldsColumn2={mapFields2}
                            index={index}
                          />
                        )
                      })}
                      {placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </FieldsContext.Provider>
      </div>
    </Layout>
  )
}
