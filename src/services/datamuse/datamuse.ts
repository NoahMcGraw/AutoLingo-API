import axios from 'axios'
import { formatUrlGetParams } from '../../utils'
import { DMAPIResponse, DMAPIResponseSingular } from '../../models/DMApi.model'
import SourceWord from '../../models/SourceWord.model'

/** /========================================\
 *  |=======Source Word Get Endpoints========|
 *  \========================================/
 *
 * Integrates with the datamuse api to source word lists
 * API documentation @ https://www.datamuse.com/api/
 */

/**
 * DEPRECATED: Fetches a list of words of determined length and topic
 * @param wordNumber: Number - Number of words to return from the request
 * @param lang: String - Alternate language to return. Known Options: es | en
 * @returns List of random words
 */
export const getSourceWords = (wordNumber: number, lang: string = 'en', topic: string = 'travel') =>
  new Promise<SourceWord[]>((resolve, reject) => {
    reject('This endpoint has been deprecated. Please use the openai/getSourceWords endpoint instead.')
    // The random word api defaults to returning english and does not accept an 'en' lang code so we will just blank the value.
    // if (lang == 'en') {
    //   lang = ''
    // }
    // const _params = [
    //   {
    //     key: 'max',
    //     value: wordNumber.toString(),
    //   },
    //   {
    //     key: 'v',
    //     value: lang,
    //   },
    //   {
    //     key: 'topics',
    //     value: topic,
    //   },
    //   {
    //     key: 'rel_trg',
    //     value: topic,
    //   },
    //   // {
    //   //   key: "rel_gen",
    //   //   value: topic
    //   // }
    //   // {
    //   //   key: "rel_spc",
    //   //   value: topic
    //   // }
    // ]
    // axios({
    //   method: 'GET',
    //   url: `${process.env.VITE_DATAMUSE_API_URL}/words${formatUrlGetParams(_params)}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then((x: any) => x.data)
    //   .then((sourceWordArr: DMAPIResponse) => {
    //     const _sourceWordArr = pullWordsFromDMResponse(sourceWordArr)
    //     resolve(_sourceWordArr)
    //   })
  })

/**
 * Fetches a list of search suggestions based of the search string passed and maxResults
 * @param searchString: String - Current search string
 * @param maxResults: Number - Max number of results to return
 * @param lang: String - Alternate language to return. Known Options: es | en
 * @returns List of random words
 */
export const getSearchSuggestions = (searchString: string, maxResults: number, lang: string = 'en') =>
  new Promise<SourceWord[]>((resolve, reject) => {
    // The random word api defaults to returning english and does not accept an 'en' lang code so we will just blank the value.
    if (lang == 'en') {
      lang = ''
    }

    const _params = [
      {
        key: 's',
        value: searchString,
      },
      {
        key: 'max',
        value: maxResults.toString(),
      },
      {
        key: 'v',
        value: lang,
      },
    ]
    axios({
      method: 'GET',
      url: `${process.env.VITE_DATAMUSE_API_URL}/sug${formatUrlGetParams(_params)}`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((x: any) => x.data)
      .then((sugWordArr: DMAPIResponse) => {
        const _sugWordArr = pullWordsFromDMResponse(sugWordArr)
        resolve(_sugWordArr)
      })
  })

const pullWordsFromDMResponse = (sourceWordArr: DMAPIResponse) => {
  let pulledArr = [] as SourceWord[]
  sourceWordArr.map((sourceWordObj: DMAPIResponseSingular) => {
    // If the word prop exists and the source word has not already been added to the list.
    if (typeof sourceWordObj.word !== 'undefined' && pulledArr.indexOf(sourceWordObj.word) === -1) {
      pulledArr.push(sourceWordObj.word)
    }
  })
  return pulledArr
}
