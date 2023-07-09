# AutoLingo - Generated Flash Cards for Learning a New Language

This is the associated API code for the [AutoLingo Flash Card App](https://github.com/NoahMcGraw/AutoLingo)

# Required Setup

## Init npm

`npm i`

## Create a free Azure Account and Translator API account.

Unfortunately, the free version of the translator api does have limitations so I cannot just share my endpoint with everyone. Luckily, setting up your own endpoint is fast, easy, and free. Follow along at https://docs.microsoft.com/en-us/azure/cognitive-services/translator/quickstart-translator?tabs=nodejs if you're confused.

## Create yourself a .env file in the top level.

This is where you will store the API integration details.

The variables you'll need:
`VITE_DATAMUSE_API_URL=https://api.datamuse.com` (This is a public open-source api. With that said, this url may be subject to change.)
`VITE_MS_TRANSLATOR_API_URL`
`VITE_MS_TRANSLATOR_API_KEY`
`VITE_MS_TRANSLATOR_API_LOCALITY`
`VITE_OPENAI_API_KEY`
`VITE_ALLOWED_ORIGINS`
