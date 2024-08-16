import * as path from 'path'
import * as fs from 'fs/promises'
import { z } from 'zod'
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'

import { WORKING_DIRECTORY } from './index.js'

export const writeDocumentTool = new DynamicStructuredTool({
  name: 'write_document',
  description: 'Create and save a text document.',
  schema: z.object({
    content: z.string(),
    file_name: z.string()
  }),
  func: async ({ content, file_name }) => {
    const filePath = path.join(WORKING_DIRECTORY, file_name)
    await fs.writeFile(filePath, content)
    return `Document saved to ${file_name}`
  }
})
