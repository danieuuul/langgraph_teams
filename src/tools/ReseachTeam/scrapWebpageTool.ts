import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export const scrapeWebpage = new DynamicStructuredTool({
  name: 'scrape_webpage',
  description: 'Scrape the contents of a webpage.',
  schema: z.object({
    url: z.string()
  }),
  func: async ({ url }) => {
    const loader = new CheerioWebBaseLoader(url)
    const docs = await loader.load()
    const formattedDocs = docs.map(
      (doc) =>
        `<Document name="${doc.metadata?.title}">\n${doc.pageContent}\n</Document>`
    )
    return formattedDocs.join('\n\n')
  }
})
