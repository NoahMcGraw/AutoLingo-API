import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import TranslatedWord from '../../models/TranslatedWord.model'
import SourceWord from '../../models/SourceWord.model'
import { MSAPIResponse, MSAPIResponseSingular } from '../../models/MSApi.model'

/** /========================================\
 *  |== Microsoft Tranlator Get Endpoints====|
 *  \========================================/
 *
/**
 * Translates the arr of source words into the desired language
 * @param wordList: String[] - List of words to translate
 * @param sourceLang: String - Source language being translated from
 * @param targetLang: String - Target language to translate into
 * @returns List of tranlated words
 */
export const getTranslations = (wordList: string[], sourceLang: string = 'en', targetLang: string = 'es') =>
  new Promise<TranslatedWord[]>((resolve, reject) => {
    var subscriptionKey = process.env.VITE_MS_TRANSLATOR_API_KEY
    var endpoint = process.env.VITE_MS_TRANSLATOR_API_URL

    // Add your location, also known as region. The default is global.
    // This is required if using a Cognitive Services resource.
    var location = process.env.VITE_MS_TRANSLATOR_API_LOCALITY

    // Check to make sure we have a key and region.
    if (!subscriptionKey) {
      throw new Error('Environment variable for your subscription key is not set.')
    }

    if (!endpoint) {
      throw new Error('Environment variable for your endpoint is not set.')
    }

    if (!location) {
      throw new Error('Environment variable for your location is not set.')
    }

    try {
      axios(`${endpoint}/translate`, {
        method: 'post',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Ocp-Apim-Subscription-Region': location,
          'Content-type': 'application/json',
          'X-ClientTraceId': uuidv4().toString(),
        },
        params: {
          'api-version': '3.0',
          from: sourceLang,
          to: targetLang,
        },
        data: wordList.map((word: SourceWord) => {
          return {
            text: word,
          }
        }),
        responseType: 'json',
      })
        .then((x) => x.data)
        .then((translationsObjArr: MSAPIResponse) => {
          const translationList = pullTranslationFromMSResponse(translationsObjArr)
          resolve(translationList)
        })
    } catch (_error) {
      const error = _error as Error
      console.error(error.message)
      reject(error)
    }
  })

const pullTranslationFromMSResponse = (translationsObjArr: MSAPIResponse): TranslatedWord[] => {
  let translationsFlatArr = [] as TranslatedWord[]
  translationsObjArr.map((translationObj: MSAPIResponseSingular) => {
    let translatedText = 'Unknown'
    if (typeof translationObj.translations !== 'undefined' && translationObj.translations.length > 0) {
      // TODO: Accept multiple versions of the translation.
      const firstTranslation = translationObj.translations[0]
      if (typeof firstTranslation.text !== 'undefined') {
        translatedText = firstTranslation.text
      }
    }

    translationsFlatArr.push(translatedText)
  })
  return translationsFlatArr
}
