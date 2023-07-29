import { v4 as uuidv4 } from 'uuid'
import { getSourceWords } from '../openai/openai'
import { getTranslations } from '../microsoft-translator/microsoft-translator'
import { mergeTranslationsIntoCardList } from '../integration-bridge/bridge'
import Deck from '../../models/Deck.model'
import Card from '../../models/Card.model'

/**
 * @param id ID of the deck to retrieve
 * @returns The deck with the given ID
 */
export const getDeck = async (id: string): Promise<Deck> => {
  let deck = {} as Deck
  // TODO: Implement this as a db call when the db is implemented

  // For now, if the app is running in dev mode, we will return a mock deck from the mock data file under db/mocks
  if (process.env.NODE_ENV === 'development') {
    const mockDecks = require('../../db/mocks/decks.test.json')
    if (mockDecks && mockDecks.length > 0) {
      const mockDeck = mockDecks.find((deck: Deck) => deck.id === id)
      if (mockDeck) {
        deck = mockDeck
      }
    }
  }

  return deck
}

/**
 * @returns All decks in the database belonging to the user
 * @throws If the user does not exist
 */
export const getAllDecks = async (): Promise<Deck[]> => {
  let decks = [] as Deck[]

  // TODO: Implement this as a db call when the db is implemented

  // For now, if the app is running in dev mode, we will return a mock deck from the mock data file under db/mocks
  if (process.env.NODE_ENV === 'development') {
    const mockDecks = require('../../db/mocks/decks.test.json') as Deck[]
    decks = mockDecks
  }

  return decks
}

/**
 * @param deck The deck to add a topic to (Will be replaced with ID in future)
 * @param topic The topic to add to the deck
 * @returns The deck with the added topic
 * @throws If the deck does not exist
 */
export const addTopicsToDeck = async (deck: Deck, topics: string[]): Promise<Deck> => {
  let maxCardsPerTopic = 15

  let cardsToAdd = [] as Card[]

  // If we have more than 100 cards, lets limit the amount of cards per topic to 100 / topic count
  if (topics.length * maxCardsPerTopic > 100) {
    maxCardsPerTopic = Math.floor(100 / topics.length)
  }

  /**
   * First, call the source word api for each topic to retrieve our starting word set.
   */
  for (const topic of topics) {
    try {
      // We can now await the promise returned by getSourceWords
      const sources = await getSourceWords({ wordNumber: maxCardsPerTopic, topic: topic, lang: deck.sourceLang })

      for (const source of sources) {
        cardsToAdd.push({
          id: uuidv4(),
          topic: topic,
          sourceWord: source,
        } as Card)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Create sourcelist by flattening the cardsToAdd sourceWord property into a single array
  const sourceList = cardsToAdd.map((card) => card.sourceWord)

  // If the request was successful,
  if (typeof sourceList !== 'undefined' && sourceList.length > 0) {
    /**
     * Then, call the translation api and pass it the source word list
     */
    let translatedList = await getTranslations(sourceList, deck.sourceLang, deck.targetLang).catch((err) => {
      console.error(err)
    })

    /**
     * Combine the two lists together into our prelim list result
     */
    mergeTranslationsIntoCardList(cardsToAdd, translatedList)

    /**
     * Due to how MS Tranlator handles words that it cannot translate, lets check to see if either we were handed back the same word as we passed the translation api (Default MS behavior) or if some other odd translation case exists. If so, we will trim those entries out of the merged list and requery the apis for the amount of records we trimmed.
     */
    // let toRefreshCount = 0 // Keep track of how many records we trim from the list so we can refresh that many from the server.
    // mergedList.map((listEntry: TranslatedResultObj, i: number) => {
    //   if (
    //     listEntry.source.toLowerCase() === listEntry.translation.toLowerCase() ||
    //     !listEntry.translation.length ||
    //     listEntry.translation === 'Unknown'
    //   ) {
    //     mergedList.splice(i, 1)
    //     // toRefreshCount++
    //   }
    // })
    // if (toRefreshCount > 0) {
    //   // Here, if we've trimmed anything out of the mergedList, lets recursively build new entries for the list and append them to the result.
    //   const newListEntries = await buildTranslationsList(toRefreshCount, sourceLang, targetLang)
    //   mergedList = mergedList.concat(newListEntries)
    // }
  }

  // Finally, lets add the cards to the deck
  deck.cards = deck.cards.concat(cardsToAdd)

  return deck
}

/**
 * @param deck The deck to remove a topic from (Will be replaced with ID in future)
 * @param topic The topic to remove from the deck
 * @returns The deck with the removed topic
 * @throws If the deck does not exist
 */
export const removeTopicFromDeck = async (deck: Deck, topic: string): Promise<Deck> => {
  deck.topics = deck.topics.filter((t) => t !== topic)
  deck.cards = deck.cards.filter((c) => c.topic !== topic)

  // Send the editted deck props as payload to the editDeck function
  await editDeck(deck.id, deck)

  // TODO: Change to return value from editDeck once db is implemented
  return deck
}

/**
 * @param deck The deck to remove a card from (Will be replaced with ID in future)
 * @param cardId The card to remove from the deck
 * @returns The deck with the removed card
 * @throws If the deck does not exist
 * @throws If the card does not exist
 *
 */
export const removeCardFromDeck = async (deck: Deck, cardId: string): Promise<Deck> => {
  deck.cards = deck.cards.filter((c) => c.id !== cardId)

  // Send the editted deck props as payload to the editDeck function
  await editDeck(deck.id, deck)

  // TODO: Change to return value from editDeck once db is implemented
  return deck
}

/**
 * @param name : string: Name of the deck to create
 * @param sourceLang : string: source language code
 * @param targetLang : string: target language code
 * @param topics : string[]: topics used to generate related words
 * @returns new Deck instance that was created
 * @throws If params are invalid
 */
export const createDeck = async (
  name: string,
  sourceLang: string,
  targetLang: string,
  topics: string[]
): Promise<Deck> => {
  // First, lets define our deck object
  const newDeckBase = {
    id: uuidv4(),
    name: name,
    topics: topics,
    sourceLang: sourceLang,
    targetLang: targetLang,
    cards: [] as Card[],
  } as Deck

  // Next, lets add the topics to the deck
  const newDeckWithCards = await addTopicsToDeck(newDeckBase, topics)

  const newDeck = await addDeck(newDeckWithCards)

  return newDeck
}

/**
 * @param deck The deck to add to the database
 * @returns The deck that was added to the database
 * @throws If the deck already exists
 * @throws If the deck is invalid
 */

const addDeck = async (deck: Deck): Promise<Deck> => {
  //TODO: Implement this function
  return deck
}

/**
 * @param id ID of the deck to edit
 * @param payload The changes to make to the deck
 * @returns The deck that was edited
 * @throws If the deck does not exist
 * @throws If the payload is invalid
 */
export const editDeck = async (id: string, payload: Deck): Promise<Deck> => {
  //TODO: Implement this function
  return {} as Deck
}

/**
 * @param id ID of the deck to delete
 * @returns true : if the deck was deleted successfully
 * @throws If the deck does not exist
 */
export const deleteDeck = async (id: string): Promise<true> => {
  //TODO: Implement this function
  return true
}
