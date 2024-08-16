import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'
import { HumanMessage } from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'

import { ChatOpenAI } from '@langchain/openai'
import { Runnable, RunnableConfig } from '@langchain/core/runnables'
import { StructuredTool } from '@langchain/core/tools'

export async function createAgent(
  llm: ChatOpenAI,
  tools: StructuredTool[],
  systemPrompt: string
): Promise<Runnable> {
  const combinedPrompt =
    systemPrompt +
    '\nWork autonomously according to your specialty, using the tools available to you.' +
    ' Do not ask for clarification.' +
    ' Your other team members (and other teams) will collaborate with you with their own specialties.' +
    ' You are chosen for a reason! You are one of the following team members: {team_members}.'
  const toolNames = tools.map((t) => t.name).join(', ')
  const prompt = await ChatPromptTemplate.fromMessages([
    ['system', combinedPrompt],
    new MessagesPlaceholder('messages'),
    new MessagesPlaceholder('agent_scratchpad'),
    [
      'system',
      [
        'Supervisor instructions: {instructions}\n' +
          `Remember, you individually can only use these tools: ${toolNames}` +
          '\n\nEnd if you have already completed the requested task. Communicate the work completed.'
      ].join('\n')
    ]
  ])
  const agent = await createOpenAIToolsAgent({ llm, tools, prompt })
  return new AgentExecutor({ agent, tools })
}

export async function runAgentNode(params: {
  state: any
  agent: Runnable
  name: string
  config?: RunnableConfig
}) {
  const { state, agent, name, config } = params
  const result = await agent.invoke(state, config)
  return {
    messages: [new HumanMessage({ content: result.output, name })]
  }
}
