'use client'

import { useState, type FormEvent } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useTeamStore } from '@/components/teams/team-store'
import type { InspectionQuestion, InspectionQuestionType, InspectionTemplate } from './inspection-store'
import styles from './inspection.module.css'

const ORDER_OPTIONS = [
  { id: 'OS-2481', vessel: 'Santa Maria', service: 'Revisão do motor principal' },
  { id: 'OS-2480', vessel: 'Lula Branca', service: 'Troca do sistema hidráulico' },
  { id: 'OS-2479', vessel: 'Maré Alta', service: 'Inspeção elétrica e sonar' },
  { id: 'OS-2478', vessel: 'Estrela do Sul', service: 'Manutenção do guincho de rede' },
  { id: 'OS-2477', vessel: 'São Pedro II', service: 'Reparo na bomba de porão' },
  { id: 'OS-2476', vessel: 'Vento Leste', service: 'Revisão preventiva do motor' },
  { id: 'OS-2475', vessel: 'Pescador I', service: 'Substituição de hélice' },
  { id: 'OS-2474', vessel: 'Rainha do Mar', service: 'Calibração do radar' },
]

type TemplateFormProps = {
  onClose: () => void
  onSave: (template: InspectionTemplate) => void
}

type DraftQuestion = Omit<InspectionQuestion, 'id'> & { id: string }

function makeQuestion(): DraftQuestion {
  return { id: crypto.randomUUID(), label: '', type: 'text', required: true }
}

export function InspectionTemplateForm({ onClose, onSave }: TemplateFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allowPhotos, setAllowPhotos] = useState(true)
  const [questions, setQuestions] = useState<DraftQuestion[]>([makeQuestion()])

  function updateQuestion(id: string, updates: Partial<DraftQuestion>) {
    setQuestions(current => current.map(question => question.id === id ? { ...question, ...updates } : question))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ id: crypto.randomUUID(), title: title.trim(), description: description.trim(), allowPhotos, questions: questions.map(question => ({ ...question, label: question.label.trim() })), createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) })
  }

  return <div className={styles.overlay} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="template-form-title" aria-describedby="template-form-description">
      <header className={styles.drawerHeader}><div><span className={styles.kicker}>BIBLIOTECA DE INSPEÇÕES</span><h2 id="template-form-title">Novo template</h2><p id="template-form-description">Defina as perguntas que o inspetor deverá responder em campo.</p></div><button type="button" className={styles.iconButton} aria-label="Fechar formulário" onClick={onClose}><X size={18}/></button></header>
      <form className={styles.drawerForm} onSubmit={submit}>
        <label className={styles.field}>Nome do template<input required maxLength={100} autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex.: Inspeção do casco"/></label>
        <label className={styles.field}>Descrição<textarea maxLength={300} rows={2} value={description} onChange={event => setDescription(event.target.value)} placeholder="Explique o objetivo e quando usar este roteiro"/></label>
        <div className={styles.questionHeading}><div><h3>Perguntas</h3><p>As perguntas marcadas como obrigatórias precisam ser respondidas.</p></div><button type="button" className={styles.secondaryButton} onClick={() => setQuestions(current => [...current, makeQuestion()])}><Plus size={14}/> Adicionar</button></div>
        <div className={styles.questionList}>{questions.map((question, index) => <section className={styles.questionEditor} key={question.id} aria-label={`Pergunta ${index + 1}`}>
          <div className={styles.questionEditorTop}><strong>Pergunta {String(index + 1).padStart(2, '0')}</strong>{questions.length > 1 && <button type="button" className={styles.removeQuestion} aria-label={`Remover pergunta ${index + 1}`} onClick={() => setQuestions(current => current.filter(item => item.id !== question.id))}><Trash2 size={14}/></button>}</div>
          <label className={styles.field}>Enunciado<input required maxLength={180} value={question.label} onChange={event => updateQuestion(question.id, { label: event.target.value })} placeholder="Digite a pergunta"/></label>
          <div className={styles.questionOptions}><label className={styles.field}>Tipo de resposta<select value={question.type} onChange={event => updateQuestion(question.id, { type: event.target.value as InspectionQuestionType })}><option value="text">Texto livre</option><option value="yes-no">Sim ou não</option><option value="conformity">Conforme / não conforme</option></select></label><label className={styles.requiredToggle}><input type="checkbox" checked={question.required} onChange={event => updateQuestion(question.id, { required: event.target.checked })}/> Obrigatória</label></div>
        </section>)}</div>
        <label className={styles.photoToggle}><input type="checkbox" checked={allowPhotos} onChange={event => setAllowPhotos(event.target.checked)}/><span><strong>Permitir fotos na inspeção</strong><small>O inspetor poderá anexar até 4 imagens como evidência.</small></span></label>
        <div className={styles.formActions}><button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button><button type="submit" className="primary-btn"><Plus size={15}/> Criar template</button></div>
      </form>
    </aside>
  </div>
}

type AssignmentFormProps = {
  template: InspectionTemplate
  onClose: () => void
  onSave: (order: { id: string; vessel: string }, inspector: { id: string; name: string }) => void
}

export function InspectionAssignmentForm({ template, onClose, onSave }: AssignmentFormProps) {
  const { technicians } = useTeamStore()
  const [orderId, setOrderId] = useState('')
  const [inspectorId, setInspectorId] = useState('')
  const order = ORDER_OPTIONS.find(item => item.id === orderId)
  const inspector = technicians.find(item => item.id === inspectorId)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (order && inspector) onSave({ id: order.id, vessel: order.vessel }, { id: inspector.id, name: inspector.name })
  }

  return <div className={styles.overlay} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <aside className={`${styles.drawer} ${styles.assignmentDrawer}`} role="dialog" aria-modal="true" aria-labelledby="assignment-form-title" aria-describedby="assignment-form-description">
      <header className={styles.drawerHeader}><div><span className={styles.kicker}>ATRIBUIR INSPEÇÃO</span><h2 id="assignment-form-title">Escolha OS e inspetor</h2><p id="assignment-form-description">A inspeção usará o template <strong>{template.title}</strong>.</p></div><button type="button" className={styles.iconButton} aria-label="Fechar atribuição" onClick={onClose}><X size={18}/></button></header>
      <form className={styles.drawerForm} onSubmit={submit}>
        <label className={styles.field}>Ordem de serviço<select required value={orderId} onChange={event => setOrderId(event.target.value)}><option value="" disabled>Selecione uma ordem</option>{ORDER_OPTIONS.map(item => <option key={item.id} value={item.id}>{item.id} · {item.vessel} — {item.service}</option>)}</select></label>
        <label className={styles.field}>Inspetor responsável<select required value={inspectorId} onChange={event => setInspectorId(event.target.value)}><option value="" disabled>Selecione um profissional</option>{technicians.map(person => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label>
        <div className={styles.assignmentSummary}><strong>{template.questions.length} perguntas</strong><span>{template.allowPhotos ? 'Fotos permitidas' : 'Sem anexos de fotos'}</span></div>
        <div className={styles.formActions}><button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button><button type="submit" className="primary-btn"><Plus size={15}/> Atribuir inspeção</button></div>
      </form>
    </aside>
  </div>
}
