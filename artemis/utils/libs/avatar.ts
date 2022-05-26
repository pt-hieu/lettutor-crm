const api = 'https://ui-avatars.com/api'

const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let c = (hash & 0x00ffffff).toString(16).toUpperCase()
  return '00000'.substring(0, 6 - c.length) + c
}

export const getAvatarLinkByName = (name: string) =>
  `${api}/?name=${name}&color=fff&background=${stringToColor(name)}`
