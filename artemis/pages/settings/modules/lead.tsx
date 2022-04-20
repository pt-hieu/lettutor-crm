import { Tabs } from 'antd'
import { off } from 'process'
import React, { useState } from 'react'
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd'

import { Column } from '@components/Settings/Customization/Column'
import { TField } from '@components/Settings/Customization/Field'
import { SEPERATOR, Section } from '@components/Settings/Customization/Section'
import { Sidebar } from '@components/Settings/Customization/Sidebar'

import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'

const { TabPane } = Tabs

const fields = {
  'field-1': { id: 'field-1', content: 'Take out the garbage' },
  'field-2': { id: 'field-2', content: 'Watch my favorite show' },
  'field-3': { id: 'field-3', content: 'Charge my phone' },
  'field-4': { id: 'field-4', content: 'Cook dinner' },
}

const initialData = {
  sections: {
    'section-1': {
      id: 'section-1',
      title: 'To do',
      fieldIds1: ['field-1', 'field-2', 'field-3', 'field-4'],
      fieldIds2: [],
    },
    'section-2': {
      id: 'section-2',
      title: 'In progress',
      fieldIds1: [],
      fieldIds2: [],
    },
    'section-3': {
      id: 'section-3',
      title: 'Done',
      fieldIds1: [],
      fieldIds2: [],
    },
    'section-4': {
      id: 'section-4',
      title: 'Review',
      fieldIds1: [],
      fieldIds2: [],
    },
  },
  // Facilitate reordering of the columns
  sectionOrder: ['section-1', 'section-2', 'section-3', 'section-4'],
}

type TSection = {
  id: string
  title: string
  fieldIds1: string[]
  fieldIds2: string[]
}

const Main = () => {
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    initialData.sectionOrder,
  )
  const [sections, setSections] = useState<Record<string, TSection>>(
    initialData.sections,
  )

  const handleDragStart = () => {}

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result
    if (!destination) return

    const sourceId = source.droppableId
    const destinationId = destination.droppableId

    if (destinationId === sourceId && destination.index === source.index) return

    if (sourceId === 'new-fields') {
      console.log('from new field')
      return
    }

    if (type === 'section') {
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

    // In the same column
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

    //In the same section
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

    //Moving from another section
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

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Sidebar />
      <div className="px-[64px] overflow-hidden grid grid-rows-[60px,1fr]">
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span>CREATE VIEW</span>} key="1"></TabPane>
          <TabPane tab={<span>DETAIL VIEW</span>} key="2"></TabPane>
        </Tabs>
        <div className="overflow-y-scroll pr-[60px]">
          <Droppable droppableId="all-sections" type="section">
            {({ droppableProps, innerRef, placeholder }) => (
              <div ref={innerRef} {...droppableProps}>
                {sectionOrder.map((sectionId, index) => {
                  const section = sections[sectionId]
                  const mapFields1 = section.fieldIds1.map(
                    (fieldId) => fields[fieldId as keyof typeof fields],
                  )
                  const mapFields2 = section.fieldIds2.map(
                    (fieldId) => fields[fieldId as keyof typeof fields],
                  )
                  return (
                    <Section
                      title={section.title}
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
  )
}

interface Props {
  title?: string
}

const LeadCustom = ({ title }: Props) => {
  return (
    <Layout
      key="layout"
      requireLogin
      title={title}
      header={false}
      footer={false}
    >
      <div className="grid grid-cols-[340px,1fr] grid-rows-[60px,1fr] h-screen overflow-hidden">
        <div className="col-span-2 border-b flex justify-between items-center px-4">
          <div>Lead</div>
          <div className="flex gap-4">
            <button type="button" className="crm-button-outline">
              <span className="fa fa-times mr-2" />
              Cancel
            </button>

            <button type="submit" className="crm-button">
              <Loading on={false}>
                <span className="fa fa-check mr-2" />
                Save
              </Loading>
            </button>
          </div>
        </div>
        <Main />
      </div>
    </Layout>
  )
}

export default LeadCustom
