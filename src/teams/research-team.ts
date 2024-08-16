import { ChatOpenAI } from '@langchain/openai'
import { RunnableConfig } from '@langchain/core/runnables'

import { BaseMessage } from '@langchain/core/messages'
import { StateGraphArgs } from '@langchain/langgraph'
import { createAgent, runAgentNode } from '../utilities/agent'
import { createTeamSupervisor } from '../utilities/supervisor'

// Define the ResearchTeamState interface
interface ResearchTeamState {
  messages: BaseMessage[]
  team_members: string[]
  next: string
  instructions: string
}

export class ResearchTeam {
  // This defines the agent state for the research team
  researchTeamState: StateGraphArgs['channels'] = {
    messages: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => []
    },
    team_members: {
      value: (x: string[], y: string[]) => x.concat(y),
      default: () => []
    },
    next: {
      value: (x: string, y?: string) => y ?? x,
      default: () => 'supervisor'
    },
    instructions: {
      value: (x: string, y?: string) => y ?? x,
      default: () => "Solve the human's question."
    }
  }

  llm = new ChatOpenAI({ modelName: 'gpt-4o' })

  searchAgent = await createAgent(
    llm,
    [tavilyTool],
    'You are a research assistant who can search for up-to-date info using the tavily search engine.'
  )
  searchNode = (state: ResearchTeamState, config?: RunnableConfig) => {
    return runAgentNode({ state, agent: searchAgent, name: 'Search', config })
  }

  // Uncomment if you have your import map set up correctly
  researchAgent = await createAgent(
    llm,
    [scrapeWebpage],
    'You are a research assistant who can scrape specified urls for more detailed information using the scrapeWebpage function.'
  )
  researchNode = (state: ResearchTeamState, config?: RunnableConfig) =>
    runAgentNode({ state, agent: researchAgent, name: 'WebScraper', config })

  supervisorAgent = await createTeamSupervisor(
    llm,
    'You are a supervisor tasked with managing a conversation between the' +
      ' following workers:  {team_members}. Given the following user request,' +
      ' respond with the worker to act next. Each worker will perform a' +
      ' task and respond with their results and status. When finished,' +
      ' respond with FINISH.\n\n' +
      ' Select strategically to minimize the number of steps taken.',
    ['Search', 'WebScraper']
  )
}
