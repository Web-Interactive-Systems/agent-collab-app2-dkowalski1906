import { getAIClient } from '@/lib/openai'
import { isEmpty } from 'lodash'

// function générateur : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
export const onDummyAgent = async function* () {
  const mockResponses = [
    'Bonne question ! Voici une explication rapide...',
    'Bien sûr ! Explorons cela ensemble.',
    'Voici ce que je peux te dire à ce sujet :',
    'Intéressant ! Voici une réponse possible :',
    "D'accord ! Voici une réponse simulée basée sur ta demande.",
  ]

  // Simuler a retard avant le premier token
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

  // Sélectionner une réponse random
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]

  // Stream la réponse caractères par caractères avec un petit retard
  for (let i = 0; i < response.length; i++) {
    yield response[i]
    await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50)) // simulate typing
  }
}

export const onAgent = async function ({
  agent = {},
  prompt,
  canStream = true,
  contextInputs = [],
  canThink = false
}) {
  const aiClient = await getAIClient()

  if (isEmpty(agent)) {
    agent = aiClient.cfg
  }

  if(!canThink) {
    agent.role += '\n no_think';
  }

  agent.role = `${agent.role}
                Respond in the same language of the user.
                Be to the point, and do not add any fluff.`

  if (agent.desired_response) {
    agent.role += `<role>**Your utltimate and most effective role is: ${agent.output} nothing less, nothing more**</role>.`
  }

  if (agent.response_format === 'json') {
    agent.role += '\n Ouput: json \n  ```json ... ```'
  }

  try {
    const stream = await aiClient.openai.chat.completions.create({
      model: agent.model || aiClient.cfg.model,
      stream: canStream,
      messages: [
        {
          role: 'system',
          content: agent.role,
        },
        ...contextInputs,
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: agent.temperature || 0.7,
    })

    return stream
  } catch (error) {
    console.error('Sorry something went wrong. IA', error.message)
  }

  return []
}
