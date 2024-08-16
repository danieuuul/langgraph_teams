import * as path from 'path'
import * as fs from 'fs/promises'
import { z } from 'zod'
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'

import { WORKING_DIRECTORY } from './index.js'

export const readDocumentTool = new DynamicStructuredTool({
  name: 'read_document',
  description: 'Read the specified document.',
  schema: z.object({
    file_name: z.string(),
    start: z.number().optional(),
    end: z.number().optional()
  }),
  func: async ({ file_name, start, end }) => {
    const filePath = path.join(WORKING_DIRECTORY, file_name)
    const data = await fs.readFile(filePath, 'utf-8')
    const lines = data.split('\n')
    return lines.slice(start ?? 0, end).join('\n')
  }
})
