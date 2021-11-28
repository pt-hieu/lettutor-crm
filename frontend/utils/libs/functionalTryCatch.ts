export interface IErrorResponse extends Error {
  response: {
    data: {
      message: string
      statusCode: number
    }
  }
}

type Return<T> = [T, null] | [null, IErrorResponse]

export async function asyncTryCatch<T>(
  f: () => Promise<T>,
): Promise<Return<T>> {
  try {
    const result = await f()
    return [result, null]
  } catch (e) {
    return [null, e as any]
  }
}

export function tryCatch<T>(f: () => T): Return<T> {
  try {
    const result = f()
    return [result, null]
  } catch (e) {
    return [null, e as any]
  }
}
