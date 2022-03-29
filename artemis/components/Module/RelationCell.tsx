import { useStore } from '@utils/hooks/useStore'

type Props = {
  relateTo: string
  targetId: string
}

export default function RelationCell({ relateTo, targetId }: Props) {
  const { data: relationItems } = useStore<{ name: string; id: string }[]>([
    'relation-data',
    relateTo,
  ])
  
  console.log({relationItems, relateTo, targetId});
  

  return <>{relationItems?.find((item) => item.id === targetId)?.name}</>
}
