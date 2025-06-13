import { SYMBOLS } from '@/utils/emojis'
import { atom } from 'nanostores'

export const $selectedAgentId = atom('')

export const $agents = atom([
  {
    id: Math.random().toString(),
    emoji: '📝',
    title: 'Créateur de tâches projet',
    role: "Tu es un assistant qui crée des tâches détaillées pour un projet d'entreprise.",
    response_format: 'text',
    temperature: 0.5,
    desired_response:
      "Liste des tâches claires et structurées pour faire avancer un projet d'entreprise.",
  },
  {
    id: Math.random().toString(),
    emoji: '🛠️',
    title: 'Correcteur de bugs',
    role: 'Tu es un expert en correction de bugs dans le code.',
    response_format: 'text',
    temperature: 0.3,
    desired_response:
      'Analyse les bugs et propose des corrections précises et efficaces.',
  },
])

export const addAgent = (agent = {}) => {
  const agents = $agents.get()
  // if has id, then update existing,
  // else create new agent
  if (agent?.id) {
    const index = agents.findIndex((e) => e.id === agent.id)
    agents[index] = { ...agents[index], ...agent }
    $agents.set([...agents])
  } else {
    agent.id = Math.random().toString()
    agent.emoji = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    agent.temperature = 0.7
    $agents.set([agent, ...agents])
  }

  // set current as selected
  $selectedAgentId.set(agent.id)
}

export const removeAgent = (id) => {
  const agents = $agents.get()
  $agents.set(agents.filter((e) => e.id !== id))
}
