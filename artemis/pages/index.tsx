import Layout from '@utils/components/Layout'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {},
  }
}

export default function Index() {
  return (
    <Layout requireLogin>
      <></>
    </Layout>
  )
}
