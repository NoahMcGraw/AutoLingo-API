import Card from './Card.model'

type Deck = {
  id: string
  name: string
  topics: string[]
  sourceLang: string
  targetLang: string
  cards: Card[]
}

export default Deck
