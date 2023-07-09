// import { isWithinTokenLimit } from 'gpt-tokenizer/src/model/text-davinci-003'
import { Configuration, OpenAIApi } from 'openai'
import SourceWord from '../../models/SourceWord.model'

type getChatCompletionsGPT35TurboProps = {
  systemPrompt: string
  userPrompt: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  presence_penalty?: number
  frequency_penalty?: number
}

type getCompletionsProps = {
  prompt: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  n?: number
  stream?: boolean
  stop?: string[] | undefined
  presence_penalty?: number
  frequency_penalty?: number
  best_of?: number
  logit_bias?: JSON | undefined
  user?: string | undefined
}

type getSourceWordsProps = {
  wordNumber: number
  topic: string
  lang?: string
}

export const getSourceWords = ({ wordNumber, topic, lang = 'en' }: getSourceWordsProps) =>
  new Promise<SourceWord[]>((resolve, reject) => {
    getChatCompletionsGPT35Turbo({
      systemPrompt:
        "You are a function and your purpose is to take a topic, a languageCode, and a number of return values and return an array of the requested length containing related nouns, verbs, or adjectives to the topic in the language specified.\n\nYou can receive one JSON object as a argument containing 3 properties: \ntopic: string - The word to generate related words around, languageCode: string -\n The shortcode for the topic and related words' source language. \nn: number: The number of related words to generate.\n\nGiven the topic and language code, your function is to return a JSON object containing 1 property: \ndata: string[] - The array of related nouns, verbs, or adjectives\n\nIf one or more of the properties in the argument object were not passed, you should return a JSON object containing 2 properties:\nstatus: number - Http status code of bad params (400)\nerror: string - Message containing the reason for error.",
      userPrompt: `{\n"topic": ${topic},\n"languageCode": ${lang},\n"n": ${wordNumber}\n}`,
      frequency_penalty: 2,
      presence_penalty: 2,
      max_tokens: 3000,
    })
      .then((sourceWordArr: string[]) => {
        // console.log('Source Words:', sourceWordArr)
        resolve(sourceWordArr)
      })
      .catch((error) => {
        reject(error)
      })
  })

export const getCompletionsDavinci003 = async ({
  prompt,
  max_tokens = 60,
  temperature = 1,
  top_p = 1,
  n = 20,
  stream = false,
  stop = undefined,
  presence_penalty = 1,
  frequency_penalty = 1,
  best_of = 1,
  logit_bias = undefined,
  user = undefined,
}: getCompletionsProps): Promise<string[]> => {
  // OpenAI API configuration
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    })
  )

  // Hard token limit for OpenAI API under text-davinci-003 model
  const openaiHardTokenLimit = 4000

  let response = [] as string[]

  try {
    //check if prompt exceeds out max soft token limit
    // if (!isWithinTokenLimit(prompt, openaiHardTokenLimit)) {
    //   throw new Error('Error creating prompt: Prompt exceeds max soft token limit')
    // }

    const responseObj = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      // max_tokens,
      // temperature,
      // top_p,
      // n,
      // stream,
      // stop,
      // presence_penalty,
      // frequency_penalty,
      // best_of,
      // logit_bias,
      // user,
    })
    const completionsStr = responseObj.data.choices[0]?.text
    console.log('Completions:', completionsStr)
    // Parse the completions string into an array and trim out any non-standard characters
    try {
      if (typeof completionsStr !== 'undefined') {
        response = parseCompletions(completionsStr)
      }
    } catch (_error) {
      const error = _error as Error
      console.error('Error parsing completions:', error.message)
    }
  } catch (_error) {
    const error = _error as Error
    throw new Error(error.message)
  }

  return response
}

export const getChatCompletionsGPT35Turbo = async ({
  systemPrompt,
  userPrompt,
  max_tokens = 256,
  temperature = 1,
  top_p = 1,
  presence_penalty = 1,
  frequency_penalty = 1,
}: getChatCompletionsGPT35TurboProps): Promise<string[]> => {
  // OpenAI API configuration
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    })
  )

  // Hard token limit for OpenAI API under text-davinci-003 model
  const openaiHardTokenLimit = 4000

  let response = [] as string[]

  try {
    //check if prompt exceeds out max soft token limit
    // if (!isWithinTokenLimit(prompt, openaiHardTokenLimit)) {
    //   throw new Error('Error creating prompt: Prompt exceeds max soft token limit')
    // }

    const responseObj = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
    })
    console.log('Response:', responseObj.data.choices[0].message)

    // const completionsStr = responseObj.data.choices[0]?.text
    // console.log('Completions:', completionsStr)
    // Parse the completions string into an array and trim out any non-standard characters
    // try {
    //   if (typeof completionsStr !== 'undefined') {
    //     response = parseCompletions(completionsStr)
    //   }
    // } catch (_error) {
    //   const error = _error as Error
    //   console.error('Error parsing completions:', error.message)
    // }
  } catch (_error) {
    const error = _error as Error
    throw new Error(error.message)
  }

  return response
}

// Main function to parse completions
const parseCompletions = (completionsStr: string) => {
  let trimmedCompletionsString
  let response = [] as string[]
  try {
    trimmedCompletionsString = trimCompletionsString(completionsStr)
    response = splitCompletionString(trimmedCompletionsString)
  } catch (_error) {
    const error = _error as Error
    throw new Error(error.message)
  }
  return response
}

// Helper function to trim the completions string
const trimCompletionsString = (completionsStr: string): string => {
  let completions

  // If completionsStr is empty, then throw an error
  if (completionsStr === '') {
    throw new Error('Error trimming completions string: Completions string is empty')
  }

  // TODO: IMPLEMENT THIS
  return completionsStr

  // // If completionsStr is not empty, then try trimByBrackets
  // const trimByBracketsRes = trimByBrackets(completionsStr)
  // // If trimByBrackets is not empty, then use it
  // if (trimByBracketsRes !== '') {
  //   completions = trimByBracketsRes
  //   return completions
  // }
  // // If trimByBrackets is empty, then try trimByDoubleQuotes
  // const trimByDoubleQuotesRes = trimByDoubleQuotes(completionsStr)
  // // If trimByDoubleQuotes is not empty, then use it
  // if (trimByDoubleQuotesRes !== '') {
  //   completions = trimByDoubleQuotesRes
  //   return completions
  // }
  // // If trimByDoubleQuotes is empty, then try trimBySingleQuotes
  // const trimBySingleQuotesRes = trimBySingleQuotes(completionsStr)
  // // If trimBySingleQuotes is not empty, then use it
  // if (trimBySingleQuotesRes !== '') {
  //   completions = trimBySingleQuotesRes
  //   return completions
  // }
  // // If trimBySingleQuotes is empty, then try trimByNumberedList
  // const trimByNumberedListRes = trimByNumberedList(completionsStr)
  // // If trimByNumberedList is not empty, then use it
  // if (trimByNumberedListRes !== '') {
  //   completions = trimByNumberedListRes
  //   return completions
  // } else {
  //   throw new Error('Error trimming completions string: No valid trim method found: ' + completionsStr)
  // }
}

const splitCompletionString = (completionsStr: string): string[] => {
  // TODO: IMPLEMENT THIS
  return completionsStr.split('\n')

  // let response = splitByDoubleQuotesAndCommas(completionsStr)
  // if (response.length === 3) {
  //   return response
  // }
  // response = splitBySingleQuotesAndCommas(completionsStr)
  // if (response.length === 3) {
  //   return response
  // }
  // response = splitByNewlines(completionsStr)
  // if (response.length === 3) {
  //   return response
  // }
  // response = splitByNumberedList(completionsStr)
  // if (response.length === 3) {
  //   return response
  // } else {
  //   throw new Error('Error parsing completions string: No valid formats found. Completions: ' + completionsStr)
  // }
}
