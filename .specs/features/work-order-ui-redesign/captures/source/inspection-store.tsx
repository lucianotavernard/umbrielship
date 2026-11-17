'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type InspectionQuestionType = 'text' | 'yes-no' | 'conformity'

export type InspectionQuestion = {
  id: string
  label: string
  type: InspectionQuestionType
  required: boolean
}

export type InspectionTemplate = {
  id: string
  title: string
  description: string
  allowPhotos: boolean
  questions: InspectionQuestion[]
  createdAt: string
}

export type InspectionPhoto = {
  id: string
  name: string
  dataUrl: string
}

export type InspectionAssignmentStatus = 'Pendente' | 'Em andamento' | 'Concluída'

export type InspectionAssignment = {
  id: string
  templateId: string
  orderId: string
  vessel: string
  inspectorId: string
  inspectorName: string
  status: InspectionAssignmentStatus
  answers: Record<string, string>
  photos: InspectionPhoto[]
  assignedAt: string
  completedAt?: string
}

const initialTemplates: InspectionTemplate[] = [
  {
    id: 'tpl-safety',
    title: 'Inspeção de segurança de bordo',
    description: 'Verificação dos principais itens de segurança antes da saída.',
    allowPhotos: true,
    createdAt: '18 jun, 2025',
    questions: [
      { id: 'safety-1', label: 'Coletes salva-vidas estão acessíveis e em bom estado?', type: 'conformity', required: true },
      { id: 'safety-2', label: 'Extintores estão dentro da validade?', type: 'yes-no', required: true },
      { id: 'safety-3', label: 'Descreva qualquer risco identificado a bordo.', type: 'text', required: false },
    ],
  },
  {
    id: 'tpl-engine',
    title: 'Checklist de manutenção preventiva',
    description: 'Rotina de conferência de motor, fluídos e equipamentos auxiliares.',
    allowPhotos: false,
    createdAt: '18 jun, 2025',
    questions: [
      { id: 'engine-1', label: 'O nível de óleo está adequado?', type: 'conformity', required: true },
      { id: 'engine-2', label: 'Há ruídos ou vibrações fora do padrão?', type: 'yes-no', required: true },
      { id: 'engine-3', label: 'Anotações da inspeção', type: 'text', required: false },
    ],
  },
]

const initialAssignments: InspectionAssignment[] = [
  {
    id: 'inspection-demo-1',
    templateId: 'tpl-safety',
    orderId: 'OS-2481',
    vessel: 'Santa Maria',
    inspectorId: 'tech-2',
    inspectorName: 'Camila Rocha',
    status: 'Pendente',
    answers: {},
    photos: [],
    assignedAt: 'Hoje, 09:20',
  },
]

type InspectionStoreValue = {
  templates: InspectionTemplate[]
  assignments: InspectionAssignment[]
  createTemplate: (template: InspectionTemplate) => void
  createAssignment: (assignment: InspectionAssignment) => void
  updateAssignment: (id: string, updates: Partial<InspectionAssignment>) => void
}

const InspectionStoreContext = createContext<InspectionStoreValue | null>(null)

export function InspectionStoreProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [assignments, setAssignments] = useState(initialAssignments)

  function createTemplate(template: InspectionTemplate) {
    setTemplates(current => [template, ...current])
  }

  function createAssignment(assignment: InspectionAssignment) {
    setAssignments(current => [assignment, ...current])
  }

  function updateAssignment(id: string, updates: Partial<InspectionAssignment>) {
    setAssignments(current => current.map(assignment => assignment.id === id ? { ...assignment, ...updates } : assignment))
  }

  return <InspectionStoreContext.Provider value={{ templates, assignments, createTemplate, createAssignment, updateAssignment }}>{children}</InspectionStoreContext.Provider>
}

export function useInspectionStore() {
  const store = useContext(InspectionStoreContext)
  if (!store) throw new Error('useInspectionStore precisa ser usado dentro de InspectionStoreProvider.')
  return store
}
