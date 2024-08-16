import { chartTool } from './tools/DocumentWritingTeam/chartTool.js'
import { readDocumentTool } from './tools/DocumentWritingTeam/readDocumentTool.js'
import { writeDocumentTool } from './tools/DocumentWritingTeam/writeDocumentTool.js'

async function main() {
  await writeDocumentTool.invoke({
    content: 'Hello from LangGraph!',
    file_name: 'hello.txt'
  })

  await readDocumentTool.invoke({ file_name: 'hello.txt' })

  await chartTool.invoke({
    data: [
      { label: 'People who like graphs', value: 5000 },
      {
        label: 'People who like LangGraph',
        value: 10000
      }
    ]
  })
}
main()
