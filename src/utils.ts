/**
 * Formats and returns a string param list to append to the url.
 * @param urlParams obj arr: Arr of objs containing a key value pair
 * @return string param list
 */
export const formatUrlGetParams = (urlParams: { key: string; value: string }[]) => {
  let currentUrlParams = new URLSearchParams()
  urlParams.map((kvPair) => {
    if (kvPair.value.length > 0 && kvPair.value !== '0') currentUrlParams.set(kvPair.key, kvPair.value)
    else currentUrlParams.delete(kvPair.key)
  })
  return currentUrlParams.toString().length ? '?' + currentUrlParams.toString().replace(/\+/g, ' ') : ''
}

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
