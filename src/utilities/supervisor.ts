import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import { JsonOutputToolsParser } from 'langchain/output_parsers'
import { ChatOpenAI } from '@langchain/openai'
import { Runnable } from '@langchain/core/runnables'

export async function createTeamSupervisor(
  llm: ChatOpenAI,
  systemPrompt: string,
  members: string[]
): Promise<Runnable> {
  const options = ['FINISH', ...members]
  const functionDef = {
    name: 'route',
    description: 'Select the next role.',
    parameters: {
      title: 'routeSchema',
      type: 'object',
      properties: {
        reasoning: {
          title: 'Reasoning',
          type: 'string'
        },
        next: {
          title: 'Next',
          anyOf: [{ enum: options }]
        },
        instructions: {
          title: 'Instructions',
          type: 'string',
          description:
            'The specific instructions of the sub-task the next role should accomplish.'
        }
      },
      required: ['reasoning', 'next', 'instructions']
    }
  }
  const toolDef = {
    type: 'function' as const,
    function: functionDef
  }
  let prompt = await ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('messages'),
    [
      'system',
      'Given the conversation above, who should act next? Or should we FINISH? Select one of: {options}'
    ]
  ])
  prompt = await prompt.partial({
    options: options.join(', '),
    team_members: members.join(', ')
  })

  const supervisor = prompt
    .pipe(
      llm.bind({
        tools: [toolDef],
        tool_choice: { type: 'function', function: { name: 'route' } }
      })
    )
    .pipe(new JsonOutputToolsParser())
    // select the first one
    .pipe((x) => ({
      next: x[0].args.next,
      instructions: x[0].args.instructions
    }))

  return supervisor
}
