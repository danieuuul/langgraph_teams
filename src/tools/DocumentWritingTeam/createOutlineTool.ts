import * as path from 'path'
import * as fs from 'fs/promises'
import { z } from 'zod'

import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'

import { WORKING_DIRECTORY } from './index.js'

export const createOutlineTool = new DynamicStructuredTool({
  name: 'create_outline',
  description: 'Create and save an outline.',
  schema: z.object({
    points: z
      .array(z.string())
      .nonempty('List of main points or sections must not be empty.'),
    file_name: z.string()
  }),
  func: async ({ points, file_name }) => {
    const filePath = path.join(WORKING_DIRECTORY, file_name)
    const data = points
      .map((point: any, index: number) => `${index + 1}. ${point}\n`)
      .join('')
    await fs.writeFile(filePath, data)
    return `Outline saved to ${file_name}`
  }
})
