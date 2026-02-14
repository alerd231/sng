export const setParam = (params: URLSearchParams, key: string, value: string, defaultValue = ''): URLSearchParams => {
  const next = new URLSearchParams(params)

  if (!value || value === defaultValue) {
    next.delete(key)
  } else {
    next.set(key, value)
  }

  return next
}
