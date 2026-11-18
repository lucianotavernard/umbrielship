'use client'

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

export type Technician = {
  id: string
  name: string
  role: string
  team: string
  email: string
  phone: string
  status: 'Disponível' | 'Em serviço' | 'Folga'
}

const initialTeam: Technician[] = [
  { id: 'tech-1', name: 'Rafael Mendes', role: 'Mecânico naval', team: 'Equipe Alfa', email: 'rafael.mendes@mareos.com.br', phone: '(13) 99821-4401', status: 'Em serviço' },
  { id: 'tech-2', name: 'Camila Rocha', role: 'Técnica elétrica', team: 'Equipe Alfa', email: 'camila.rocha@mareos.com.br', phone: '(13) 99712-3088', status: 'Disponível' },
  { id: 'tech-3', name: 'João Ferreira', role: 'Especialista hidráulico', team: 'Equipe Bravo', email: 'joao.ferreira@mareos.com.br', phone: '(13) 99640-1157', status: 'Em serviço' },
  { id: 'tech-4', name: 'Marina Alves', role: 'Técnica de manutenção', team: 'Equipe Bravo', email: 'marina.alves@mareos.com.br', phone: '(13) 99154-6620', status: 'Disponível' },
  { id: 'tech-5', name: 'Pedro Nascimento', role: 'Mecânico naval', team: 'Equipe Charlie', email: 'pedro.nascimento@mareos.com.br', phone: '(13) 99771-2083', status: 'Folga' },
  { id: 'tech-6', name: 'Bianca Costa', role: 'Técnica de docagem', team: 'Equipe Charlie', email: 'bianca.costa@mareos.com.br', phone: '(13) 99932-7804', status: 'Disponível' },
]

type TeamStoreValue = {
  technicians: Technician[]
  setTechnicians: Dispatch<SetStateAction<Technician[]>>
}

const TeamStoreContext = createContext<TeamStoreValue | null>(null)

export function TeamStoreProvider({ children }: { children: ReactNode }) {
  const [technicians, setTechnicians] = useState(initialTeam)
  return <TeamStoreContext.Provider value={{ technicians, setTechnicians }}>{children}</TeamStoreContext.Provider>
}

export function useTeamStore() {
  const store = useContext(TeamStoreContext)
  if (!store) throw new Error('useTeamStore precisa ser usado dentro de TeamStoreProvider.')
  return store
}
