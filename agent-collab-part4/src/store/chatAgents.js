import { atom, computed } from 'nanostores'
import { $agents } from './agents'

export const $selectedChatAgents = atom([])

export const $chatAgents = computed([$selectedChatAgents, $agents], (ids, agents) => {
  return ids.map((id) => agents.find((agent) => agent.id === id))
})

export const selectChatAgent = (checked, id) => {
  const selected = $selectedChatAgents.get()
  if (checked) {
    $selectedChatAgents.set([...selected, id])
  } else {
    $selectedChatAgents.set(selected.filter((e) => e !== id))
  }
}

export const setSelectChatAgents = (ids) => {
  $selectedChatAgents.set(ids)
}
