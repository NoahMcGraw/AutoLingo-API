import { SourceWord, TranslatedResultObj, TranslatedWord } from '../../models/MSApi.model'
import { getTranslations } from '../microsoft-translator/microsoft-translator'
import { getSourceWords } from '../openai/openai'

/**
 * Queries the source and then the translation apis to get the full data set for the translations and then outputs the formatted translation list
 * @param wordNumber: number: Amount of words to return
 * @param sourceLang : string: source language code
 * @param targetLang : string: target language code
 * @param topic : string: topic used to generate related words
 * @returns Obj arr containing source word and translation
 */
export const buildTranslationsList = async (
  wordNumber: number,
  sourceLang: string | undefined = undefined,
  targetLang: string | undefined = undefined,
  topic: string
) => {
  let mergedList = [] as TranslatedResultObj[]

  /**
   * First, call the source word api to retrieve our starting word set.
   */
  const sourceList = await getSourceWords({ wordNumber: wordNumber, topic: topic, lang: sourceLang }).catch((err) => {
    console.error(err)
  })
  // If the request was successful,
  if (typeof sourceList !== 'undefined' && sourceList.length > 0) {
    /**
     * Then, call the translation api and pass it the source word list
     */
    let translatedList = await getTranslations(sourceList, sourceLang, targetLang).catch((err) => {
      console.error(err)
    })
    /**
     * Combine the two lists together into our prelim list result
     */
    mergedList = mergeTranslationsIntoSourceList(sourceList, translatedList)
    /**
     * Due to how MS Tranlator handles words that it cannot translate, lets check to see if either we were handed back the same word as we passed the translation api (Default MS behavior) or if some other odd translation case exists. If so, we will trim those entries out of the merged list and requery the apis for the amount of records we trimmed.
     */
    // let toRefreshCount = 0 // Keep track of how many records we trim from the list so we can refresh that many from the server.
    mergedList.map((listEntry: TranslatedResultObj, i: number) => {
      if (
        listEntry.source.toLowerCase() === listEntry.translation.toLowerCase() ||
        !listEntry.translation.length ||
        listEntry.translation === 'Unknown'
      ) {
        mergedList.splice(i, 1)
        // toRefreshCount++
      }
    })
    // if (toRefreshCount > 0) {
    //   // Here, if we've trimmed anything out of the mergedList, lets recursively build new entries for the list and append them to the result.
    //   const newListEntries = await buildTranslationsList(toRefreshCount, sourceLang, targetLang)
    //   mergedList = mergedList.concat(newListEntries)
    // }
  }
  return mergedList
}

/**
 * Takes the source list and translation list and merges them together
 * @param sourceList: SourceWord[]: Arr of words derived from the source api
 * @param translatedList: TranslatedWord[]: Arr of words derived from the translation api
 * @returns an Obj arr containing both the source and translation as props.
 */
const mergeTranslationsIntoSourceList = (
  sourceList: SourceWord[],
  translatedList: TranslatedWord[] | void
): TranslatedResultObj[] => {
  const mergedList = [] as TranslatedResultObj[]
  for (let i = 0; i < sourceList.length; i++) {
    let mergedObj = {
      source: sourceList[i],
      translation: 'Unknown',
    } as TranslatedResultObj
    if (typeof translatedList !== 'undefined' && typeof translatedList[i] !== 'undefined') {
      mergedObj.translation = translatedList[i]
    }
    mergedList.push(mergedObj)
  }
  return mergedList
}
