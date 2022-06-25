import LRUCache from 'lru-cache'

const options = {
  max: 1_000_000,

  // for use with tracking overall storage size
  maxSize: 1_000_000,
  sizeCalculation: (value, key) => {
    return 1
  },

  // set Time To Live is 1 years
  ttl: 1000 * 60 * 60 * 24 * 365 * 2,

  // return stale items before removing from cache?
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,

  // async method to use for cache.fetch(), for
  // stale-while-revalidate type of behavior
  fetch: async (key, staleValue, { options, signal }) => { }
}

export const CustomLRU: LRUCache<string, string> = new LRUCache(options)