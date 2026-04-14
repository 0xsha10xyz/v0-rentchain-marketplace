let chain: Promise<void> = Promise.resolve()

export function runWithLock<T>(task: () => Promise<T>): Promise<T> {
  const result = chain.then(() => task())
  chain = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

