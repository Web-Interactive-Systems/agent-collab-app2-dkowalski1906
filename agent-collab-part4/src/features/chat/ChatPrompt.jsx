import { onAgent } from '@/actions/agent'
import { styled } from '@/lib/stitches'
import { $chatAgents, $messages, addMessage, updateMessages } from '@/store/store'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { Button, Flex, TextArea } from '@radix-ui/themes'
import { useRef, useState } from 'react'
import { AgentMenu } from './AgentMenu'
import { AgentSelect } from './AgentSelect'
import { useStore } from '@nanostores/react'
import { isEmpty } from 'lodash'

const PromptContainer = styled(Flex, {
  width: '100%',
  padding: '12px 18px',
  borderRadius: '18px',
  background: 'var(--accent-2)',
})

const PromptArea = styled(TextArea, {
  width: '100%',
  boxShadow: 'none',
  outline: 'none',
  background: 'none',
  '& textarea': {
    fontSize: '1.1rem',
    fontWeight: 450,
  },
})

function constructCtxArray(originalArray) {
  const result = []
  if (originalArray.length > 3) result.push(originalArray.at(-3), originalArray.at(-2))
  if (originalArray.length > 1) result.push(originalArray[1])
  if (originalArray.length > 0) result.push(originalArray[0])
  return result
}

function ChatPrompt() {
  const promptRef = useRef(null)
  const [isPromptEmpty, setIsPromptEmpty] = useState(true)

  const chatAgents = useStore($chatAgents)

  const onTextChange = () => {
    const val = promptRef.current.value || ''
    setIsPromptEmpty(val.trim().length === 0)
  }

  const onSendPrompt = async () => {
    const prompt = promptRef.current.value
    if (!prompt.trim()) return

    // Ajouter le message utilisateur
    addMessage({
      role: 'user',
      content: prompt,
      id: Math.random().toString(),
    })

    const messages = $messages.get()
    const contextInputs = constructCtxArray(messages)

    // Ajouter un message "assistant" vide
    const response = {
      role: 'assistant',
      content: '',
      id: Math.random().toString(),
      completed: false,
    }
    addMessage(response)

    // Sélection des agents
    const steps = isEmpty(chatAgents) ? [null] : chatAgents

    // Parcours de chaque agent sélectionné
    for (let i = 0, len = steps.length; i < len; i++) {
      const agent = steps[i]

      let cloned = $messages.get()

      const stream = await onAgent({ agent, prompt, contextInputs })

      for await (const part of stream) {
        const token = part.choices[0]?.delta?.content ?? ''
        const last = cloned.at(-1)

        cloned[cloned.length - 1] = {
          ...last,
          content: last.content + token,
        }

        updateMessages([...cloned])
      }

      // Marquer comme complété
      const last = cloned.at(-1)
      cloned[cloned.length - 1] = {
        ...last,
        completed: true,
      }
      updateMessages([...cloned])

      // Ajouter un nouvel assistant vide si ce n'est pas le dernier agent
      if (steps.length > 0 && i !== steps.length - 1) {
        cloned = [
          ...cloned,
          {
            role: 'assistant',
            content: '',
            id: Math.random().toString(),
            completed: false,
          },
        ]
      }
    }

    // Nettoyage une fois tous les agents traités
    promptRef.current.value = ''
    setIsPromptEmpty(true)
  }

  return (
    <Flex
      justify='center'
      mt='auto'
      width='100%'>
      <Flex
        direction='column'
        gap='3'
        width='100%'>
        <PromptContainer
          align='center'
          direction='column'>
          <PromptArea
            ref={promptRef}
            placeholder='Comment puis-je aider...'
            onChange={onTextChange}
            onKeyDown={(e) => {
              const canSend = !isPromptEmpty && e.key === 'Enter'
              const mod = e.metaKey || e.ctrlKey || e.altKey || e.shiftKey
              if (canSend && !mod) {
                e.preventDefault()
                onSendPrompt()
              }
            }}
          />
          <Flex
            justify='start'
            align='center'
            width='100%'>
            {/* Tu peux ajouter des contrôles ici */}
          </Flex>
          <Flex
            justify='end'
            width='100%'>
            <Button
              disabled={isPromptEmpty}
              onClick={onSendPrompt}>
              <PaperPlaneIcon />
            </Button>
          </Flex>
        </PromptContainer>
        <Flex>
          <AgentMenu />
          <AgentSelect />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ChatPrompt
