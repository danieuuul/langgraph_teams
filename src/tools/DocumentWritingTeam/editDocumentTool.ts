import * as path from 'path'
import * as fs from 'fs/promises'
import { z } from 'zod'

import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'

import { WORKING_DIRECTORY } from './index.js'

export const editDocumentTool = new DynamicStructuredTool({
  name: 'edit_document',
  description: 'Edit a document by inserting text at specific line numbers.',
  schema: z.object({
    file_name: z.string(),
    inserts: z.record(z.number(), z.string())
  }),
  func: async ({ file_name, inserts }) => {
    const filePath = path.join(WORKING_DIRECTORY, file_name)
    const data = await fs.readFile(filePath, 'utf-8')
    let lines = data.split('\n')

    const sortedInserts = Object.entries(inserts).sort(
      ([a], [b]) => parseInt(a) - parseInt(b)
    )

    for (const [line_number_str, text] of sortedInserts) {
      const line_number = parseInt(line_number_str)
      if (1 <= line_number && line_number <= lines.length + 1) {
        lines.splice(line_number - 1, 0, text)
      } else {
        return `Error: Line number ${line_number} is out of range.`
      }
    }

    await fs.writeFile(filePath, lines.join('\n'))
    return `Document edited and saved to ${file_name}`
  }
})
