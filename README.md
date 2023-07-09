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
(If you are enabling https traffic)
`VITE_PATH_TO_SSL_CERT`
`VITE_PATH_TO_SSL_KEY`

# Deployment

I am currently hosting this API using the GCloud App Engine. You can set up your own project by following along [here](https://cloud.google.com/appengine/docs/standard/nodejs/building-app)

Once you've deployed, make sure you add the correct values to your app.yaml file. Mine are as follows:

`runtime: nodejs20` (or similar)
`entrypoint: npm run serve`
`env_variables:`
`  VITE_DATAMUSE_API_URL`
`  VITE_MS_TRANSLATOR_API_URL`
`  VITE_MS_TRANSLATOR_API_KEY`
`  VITE_MS_TRANSLATOR_API_LOCALITY`
`  VITE_OPENAI_API_KEY`
`  VITE_ALLOWED_ORIGINS`

Then, you can run `gcloud app deploy` to deploy
