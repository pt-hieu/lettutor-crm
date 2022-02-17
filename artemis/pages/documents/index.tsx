import Layout from '@utils/components/Layout'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getDocumentCategories, getDocuments } from '@utils/service/document'
import { AnimatePresence, motion } from 'framer-motion'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import remarkGfm from 'remark-gfm'

export const getStaticProps: GetStaticProps = async () => {
  const client = new QueryClient()
  await client.prefetchQuery('documents', getDocuments())

  return {
    revalidate: 15,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function DocumentsPage() {
  const { data: documents } = useQuery('documents', getDocuments(), {
    enabled: false,
  })

  const [selectedItem] = useQueryState<string>('item')

  const [expands, setExpands] = useState<string[]>([])
  const toggleExpands = useCallback(
    (name: string) => () => {
      const isExpanded = expands.includes(name)
      if (isExpanded) {
        setExpands((e) => e.filter((v) => v !== name))
        return
      }

      setExpands((e) => e.concat(name))
    },
    [expands],
  )

  const { data: item } = useQuery(
    ['doc-cate', selectedItem],
    getDocumentCategories(selectedItem || ''),
    {
      enabled: !!selectedItem,
    },
  )

  return (
    <Layout title="Artemis Document">
      <div className="crm-container">
        <div className="text-blue-600 font-semibold text-xl mb-4">
          Documents
        </div>

        <div className="grid grid-cols-[300px,1fr] gap-8">
          <div>
            {documents?.items.map((doc) => (
              <div key={doc.slug}>
                <button
                  className="flex justify-between items-center w-full pb-2"
                  onClick={toggleExpands(doc.name)}
                >
                  <span className="font-medium">{doc.name}</span>
                  <motion.span
                    initial={false}
                    animate={{ rotate: expands.includes(doc.name) ? 90 : 0 }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                    className="fa-solid fa-angle-right"
                  />
                </button>

                <AnimatePresence exitBeforeEnter presenceAffectsLayout>
                  {expands.includes(doc.name) && (
                    <motion.div
                      className="overflow-hidden flex flex-col gap-1"
                      initial={{ opacity: 0, height: 0, margin: 0 }}
                      exit={{ opacity: 0, height: 0, margin: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      transition={{ ease: 'easeInOut', duration: 0.2 }}
                    >
                      {doc.document_categories.map((cate) => (
                        <Link
                          key={cate.slug}
                          href={`/documents?item=${cate.slug}`}
                          shallow
                        >
                          <a className="flex gap-2 pl-4 text-gray-900">
                            <span className="inline-block w-[3px] h-[22px] bg-blue-600" />
                            <span>{cate.name}</span>
                          </a>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <ReactMarkdown className="markdown-body" remarkPlugins={[remarkGfm]}>
            {item?.document_items?.map((item) => item.content).join(' ') || ''}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  )
}
