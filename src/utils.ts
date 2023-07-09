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

// Helper function to trim a string by curly brackets
export const trimByCurlyBrackets = (string: string) => {
  let response = ''
  // Find the first bracket in the string and trim off everything before it
  const start = string.indexOf('{')
  // Find the last bracket in the string and trim off everything after it
  const end = string.lastIndexOf('}') + 1
  response = string.substring(start, end)
  return response
}

// Helper function that removes trailing commas that are followed by a closing curly bracket or square bracket
export const removeTrailingCommas = (string: string) => {
  return string.replace(/,\s*(?=}|])/g, '')
}

// Helper function that removes instances of truncating symbols that openAI sometimes returns when it truncates a response
export const removeTruncatingSymbols = (string: string) => {
  return string.replace(/\.\.\./g, '')
}
