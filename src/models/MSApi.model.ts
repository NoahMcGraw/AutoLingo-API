export type MSAPIResponseSingular = {
  translations: {
    text: string
    to: string
  }[]
}

export type MSAPIResponse = MSAPIResponseSingular[]
