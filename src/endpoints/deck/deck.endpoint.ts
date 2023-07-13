import express from 'express'
import * as deckService from '../../services/deck/deck.service'
const router = express.Router()

router.get('/all', function (req, res) {
  try {
    const decks = deckService.getAllDecks()
    res.send(decks)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.get('/:id', function (req, res) {
  try {
    const id = req.params.id
    // If id is not a string, return an error
    if (typeof id !== 'string') {
      throw new Error('Invalid ID')
      return
    }

    const deck = deckService.getDeck(id)
    res.send(deck)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.patch('/addTopics', async function (req, res) {
  try {
    const deck = req.body.deck
    const topics = req.body.topics

    // If deck is not a complete deck object, return an error
    if (
      !hasPropertiesWithCorrectTypes<Deck>(deck, <PropTypeMap<Deck>>{
        id: 'string',
        name: 'string',
        sourceLang: 'string',
        targetLang: 'string',
        topics: 'object',
        cards: 'object',
      })
    ) {
      throw new Error('Invalid Deck')
    }

    // Add topics to deck
    await deckService.addTopicsToDeck(deck, topics)

    res.send(deck)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.patch('/removeTopic', async function (req, res) {
  try {
    const deck = req.body.deck
    const topic = req.body.topic

    // If deck is not a complete deck object, return an error
    if (
      !hasPropertiesWithCorrectTypes<Deck>(deck, <PropTypeMap<Deck>>{
        id: 'string',
        name: 'string',
        sourceLang: 'string',
        targetLang: 'string',
        topics: 'object',
        cards: 'object',
      })
    ) {
      throw new Error('Invalid Deck')
    }

    // Add topics to deck
    await deckService.removeTopicFromDeck(deck, topic)

    res.send(deck)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.patch('/removeCard', async function (req, res) {
  try {
    const deck = req.body.deck
    const cardId = req.body.cardId

    // If deck is not a complete deck object, return an error
    if (
      !hasPropertiesWithCorrectTypes<Deck>(deck, <PropTypeMap<Deck>>{
        id: 'string',
        name: 'string',
        sourceLang: 'string',
        targetLang: 'string',
        topics: 'object',
        cards: 'object',
      })
    ) {
      throw new Error('Invalid Deck')
    }

    // Add topics to deck
    await deckService.removeCardFromDeck(deck, cardId)

    res.send(deck)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.post('/create', async function (req, res) {
  try {
    const { name, sourceLang, targetLang, topics } = req.body

    // If name, sourceLang, targetLang, or topics are not strings, return an error
    if (
      typeof name !== 'string' ||
      typeof sourceLang !== 'string' ||
      typeof targetLang !== 'string' ||
      !Array.isArray(topics)
    ) {
      throw new Error('Invalid Deck')
    }

    // Create deck
    const deck = await deckService.createDeck(name, sourceLang, targetLang, topics)

    res.send(deck)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.patch('/edit', async function (req, res) {
  try {
    const id = req.body.id
    const payload = req.body.payload

    // If id is not a string, return an error
    if (typeof id !== 'string') {
      throw new Error('Invalid ID')
    }

    // If payload is not an object, return an error
    if (typeof payload !== 'object') {
      throw new Error('Invalid Deck')
    }

    // Edit deck
    const deck = await deckService.editDeck(id, payload)

    res.send(deck)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.delete('/:id', async function (req, res) {
  try {
    const id = req.params.id

    // If id is not a string, return an error
    if (typeof id !== 'string') {
      throw new Error('Invalid ID')
    }

    // Delete deck
    const isDeleted = await deckService.deleteDeck(id)

    res.send(isDeleted)
  } catch (err) {
    res.status(400).send(err)
  }
})

export default router
