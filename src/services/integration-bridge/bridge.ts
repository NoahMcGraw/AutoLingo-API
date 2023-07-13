import Card from '../../models/Card.model'
import TranslatedWord from '../../models/TranslatedWord.model'

/**
 * Takes the source list and translation list and merges them together
 * @param cardList: Card[]: Arr of card objects containing the source word
 * @param translatedList: TranslatedWord[]: Arr of words derived from the translation api
 * @returns an Obj arr containing both the source and translation as props.
 */
export const mergeTranslationsIntoCardList = (cardList: Card[], translatedList: TranslatedWord[] | void): void => {
  for (let i = 0; i < cardList.length; i++) {
    if (typeof translatedList !== 'undefined' && typeof translatedList[i] !== 'undefined') {
      cardList[i].targetWord = translatedList[i]
    }
  }
}
