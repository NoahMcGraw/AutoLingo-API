import express from 'express'
import cors from 'cors'
// import https from 'https'
// import fs from 'fs'
import dotenv from 'dotenv'
import { buildTranslationsList } from './services/integration-bridge/bridge'
import { getSearchSuggestions } from './services/datamuse/datamuse'
import originChecker from './middleware/originChecker'
// import { Server } from 'http'

// Load environment variables from .env file
dotenv.config()

// Create express app
const app = express()

// Enable CORS
app.use(cors())

// Enable origin checker middleware
app.use(originChecker)

// TODO: Uncomment this code to enable HTTPS once code is deployed to production
// const server = https.createServer(
//   {
//     // Grab paths to SSL cert and private key from environment variables
//     cert: fs.readFileSync(`${process.env.PATH_TO_SSL_CERT}`),
//     key: fs.readFileSync(`${process.env.PATH_TO_SSL_KEY}`),
//   },
//   app
// )

// server.listen(3003, () => {
//   console.log('Server is listening on port 3003.')
// })

// Provide a basic endpoint for testing
app.get('/', (_req, res) => {
  res.send('Hello Mother!')
})

// Get Route for related translations
app.get('/relatedTranslations', async (req, res) => {
  // Get the query params from the request
  const { wordNumber, sourceLang, targetLang, topic } = req.query

  // Check that the required params are present and transform them into the correct types
  if (!wordNumber || !sourceLang || !targetLang || !topic) {
    res.status(400).send('Missing required query params')
    return
  }

  if (
    typeof wordNumber !== 'string' ||
    typeof sourceLang !== 'string' ||
    typeof targetLang !== 'string' ||
    typeof topic !== 'string'
  ) {
    res.status(400).send('Invalid query params')
    return
  }

  const formattedWordNumber = parseInt(wordNumber)

  // Use the buildTranslationsList function to get the list of translations
  const translations = await buildTranslationsList(formattedWordNumber, sourceLang, targetLang, topic)

  // Return the list of translations
  res.send(translations)
})

// Get route for search suggestions
app.get('/searchSuggestions', async (req, res) => {
  // Get the query params from the request
  const { searchString, maxResults, lang } = req.query

  // Check that the required params are present and transform them into the correct types
  if (!searchString || !maxResults || !lang) {
    res.status(400).send('Missing required query params')
    return
  }

  if (typeof searchString !== 'string' || typeof maxResults !== 'string' || typeof lang !== 'string') {
    res.status(400).send('Invalid query params')
    return
  }

  const formattedMaxResults = parseInt(maxResults)

  // Use the getSearchSuggestions function to get the list of search suggestions
  const searchSuggestions = await getSearchSuggestions(searchString, formattedMaxResults, lang)

  // Return the list of search suggestions
  res.send(searchSuggestions)
})

app.listen(3003, () => {
  console.log('Server is listening on port 3003.')
})
