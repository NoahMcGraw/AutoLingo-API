// import { isWithinTokenLimit } from 'gpt-tokenizer/src/model/text-davinci-003'
import { Configuration, OpenAIApi } from 'openai'
import SourceWord from '../../models/SourceWord.model'
import { removeTrailingCommas, removeTruncatingSymbols, trimByCurlyBrackets } from '../../utils'
import { OpenAiAPICompletionsResponse } from '../../models/OpenAiAPI.model'
import { error } from 'console'

type getChatCompletionsGPT35TurboProps = {
  systemPrompt: string
  userPrompt: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  presence_penalty?: number
  frequency_penalty?: number
  stop?: string[] | undefined
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
        "You are an AI model and I am simulating a function with you called `getRelatedWordsArr`. This function receives three required arguments: a topic, a language code, and an integer 'n'. The function generates an array of 'n' related words to the topic. Generate a suitable response, which would be an object with status and data fields, where data should be an array of 'n' related words to the topic. Data should never have a length shorter than 'n'.\nYour Source Code, written in TypeScript sudo code:\n```\ntype getRelatedWordsProps = {\n  topic: string\n  languageCode: string\n  n: number\n}\nconst getRelatedWordsArr = ({ topic, languageCode, n }: getRelatedWordsProps) => {\n  let res = {\n    status: 200 as number,\n    data: [] as string[],\n  }\n  for (let i = 0; i < n; i++) {\n    res.data.push(getWordRelatedToTopic(topic, languageCode))\n  }\n  return res\n}\n```",
      userPrompt: `{\n"topic": ${topic},\n"languageCode": ${lang},\n"n": ${wordNumber}\n}`,
      temperature: 0,
      frequency_penalty: 1,
      presence_penalty: 1,
      max_tokens: 3000,
      // stop: ['...'],
    })
      .then((sourceWordArr: string[]) => {
        resolve(sourceWordArr)
      })
      .catch((error) => {
        reject(error)
      })
  })

export const getChatCompletionsGPT35Turbo = async ({
  systemPrompt,
  userPrompt,
  max_tokens = 256,
  temperature = 1,
  top_p = 1,
  presence_penalty = 1,
  frequency_penalty = 1,
  stop = undefined,
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
      model: 'gpt-3.5-turbo-0613',
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
      stop,
    })

    const completionsStr = responseObj.data.choices[0]?.message?.content
    // Parse the completions string into an array and trim out any non-standard characters
    try {
      if (typeof completionsStr !== 'undefined') {
        response = parseCompletionsRes(completionsStr)
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

// Main function to parse completions
const parseCompletionsRes = (completionsStr: string) => {
  let trimmedCompletionsString
  let response = [] as string[]
  try {
    trimmedCompletionsString = trimCompletionsResString(completionsStr)
    const completionsObj = splitCompletionResStringtoJSON(trimmedCompletionsString) as OpenAiAPICompletionsResponse
    if (completionsObj.status && completionsObj.status !== 200) {
      throw new Error('Error in response: ' + completionsObj.error)
    }
    if (!completionsObj.data) {
      throw new Error('No Data field returned')
    }
    // If the response has a data field, then we have a valid response.
    response = completionsObj.data
  } catch (_error) {
    const error = _error as Error
    throw new Error(error.message)
  }
  return response
}

// Helper function to trim the completions string
const trimCompletionsResString = (completionsStr: string): string => {
  let completions

  // If completionsStr is empty, then throw an error
  if (completionsStr === '') {
    throw new Error('Error trimming completions string: Completions string is empty')
  }

  // Attempt to trim by curly brackets
  const trimByCurlyBracketsRes = trimByCurlyBrackets(completionsStr)
  // If trimByCurlyBrackets is not empty, then use it
  if (trimByCurlyBracketsRes !== '') {
    completions = trimByCurlyBracketsRes
  } else {
    throw new Error('Error trimming completions string: No valid trim method found: ' + completionsStr)
  }

  // If completions has been set, attempt to remove trailing commas
  if (completions) {
    completions = removeTruncatingSymbols(completions)
    completions = removeTrailingCommas(completions)
  }

  return completions
}

const splitCompletionResStringtoJSON = (completionsStr: string): OpenAiAPICompletionsResponse => {
  let response: OpenAiAPICompletionsResponse
  // If the api understood the prompt, then it will return a JSON string. We need to parse it.
  try {
    const completionsObj = JSON.parse(completionsStr)
    // If the response has a status field and it is not 200, then we have an error.
    if (!completionsObj) {
      throw new Error('Response is not a valid JSON string.: ' + completionsStr)
    }
    response = completionsObj
  } catch (_error) {
    const error = _error as Error
    throw new Error(error.message)
  }

  return response
}
