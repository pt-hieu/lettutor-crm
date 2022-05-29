const api = 'https://ui-avatars.com/api'

export const getAvatarLinkByName = (name: string) =>
  `${api}/?name=${name}&color=white&background=random`
