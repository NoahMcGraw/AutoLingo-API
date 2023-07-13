import PropTypeMap from '../../models/PropTypeMap.model'

/**
 * This method checks that the passed object has the correct properties and that the properties have the correct types.
 * @param obj
 * @param propTypeMap
 * @returns
 */
export const hasPropertiesWithCorrectTypes = <T>(obj: any, propTypeMap: PropTypeMap<T>): boolean => {
  for (let key in propTypeMap) {
    // If the obj does not have the key or the key is not the correct type, return false
    if (obj[key] === undefined || typeof obj[key] !== propTypeMap[key]) {
      return false
    }
  }

  return true
}
