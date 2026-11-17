'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowLeft, Check, ImagePlus, ShieldCheck, Upload, X } from 'lucide-react'
import type { InspectionAssignment, InspectionPhoto, InspectionQuestion, InspectionTemplate } from './inspection-store'
import { useInspectionStore } from './inspection-store'
import styles from './inspection.module.css'

type InspectionRunProps = {
  assignment: InspectionAssignment
  template: InspectionTemplate
  onBack: () => void
}

function readPhoto(file: File): Promise<InspectionPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, dataUrl: String(reader.result) })
    reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

function QuestionField({ question, value, disabled, onChange }: { question: InspectionQuestion; value: string; disabled: boolean; onChange: (value: string) => void }) {
  const inputId = `answer-${question.id}`
  return <fieldset className={styles.answerField} disabled={disabled}>
    <legend>{question.label}{question.required && <span className={styles.requiredMark}> *</span>}</legend>
    {question.type === 'text' ? <textarea id={inputId} rows={3} required={question.required} value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder="Registre sua observação"/> : <div className={styles.choiceGroup}>
      {(question.type === 'yes-no' ? ['Sim', 'Não'] : ['Conforme', 'Não conforme', 'Não se aplica']).map(option => <label key={option} className={`${styles.choiceOption} ${value === option ? styles.choiceSelected : ''}`}><input type="radio" name={question.id} required={question.required} checked={value === option} onChange={() => onChange(option)}/><span>{option}</span></label>)}
    </div>}
  </fieldset>
}

export function InspectionRun({ assignment, template, onBack }: InspectionRunProps) {
  const { updateAssignment } = useInspectionStore()
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const readOnly = assignment.status === 'Concluída'
  const answers = assignment.answers
  const requiredQuestions = useMemo(() => template.questions.filter(question => question.required), [template.questions])
  const answeredCount = requiredQuestions.filter(question => Boolean(answers[question.id]?.trim())).length

  function saveAnswer(questionId: string, value: string) {
    updateAssignment(assignment.id, { answers: { ...answers, [questionId]: value }, status: 'Em andamento' })
    setError('')
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (!files.length) return
    if (assignment.photos.length + files.length > 4) {
      setError('É possível anexar até 4 imagens por inspeção.')
      return
    }
    const tooLarge = files.find(file => file.size > 4 * 1024 * 1024)
    if (tooLarge) {
      setError(`A imagem “${tooLarge.name}” excede o limite de 4 MB.`)
      return
    }
    setUploading(true)
    try {
      const photos = await Promise.all(files.map(readPhoto))
      updateAssignment(assignment.id, { photos: [...assignment.photos, ...photos], status: 'Em andamento' })
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível adicionar as imagens.')
    } finally {
      setUploading(false)
    }
  }

  function removePhoto(photoId: string) {
    updateAssignment(assignment.id, { photos: assignment.photos.filter(photo => photo.id !== photoId) })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missing = requiredQuestions.find(question => !answers[question.id]?.trim())
    if (missing) {
      setError(`Responda à pergunta obrigatória: “${missing.label}”.`)
      document.getElementById(`answer-${missing.id}`)?.focus()
      return
    }
    updateAssignment(assignment.id, { status: 'Concluída', completedAt: new Date().toLocaleString('pt-BR') })
    setError('')
  }

  return <section className={styles.runPage}>
    <button type="button" className={styles.backButton} onClick={onBack}><ArrowLeft size={15}/> Voltar às inspeções</button>
    <header className={styles.runHeader}><div><span className={styles.kicker}>INSPEÇÃO DE CAMPO · {assignment.orderId}</span><h1>{template.title}</h1><p>{template.description || 'Responda às perguntas e registre as condições encontradas.'}</p></div><span className={`${styles.statusPill} ${readOnly ? styles.statusDone : styles.statusPending}`}>{readOnly ? <Check size={13}/> : <ShieldCheck size={13}/>} {assignment.status}</span></header>
    <div className={styles.runMeta}><div><small>Embarcação</small><strong>{assignment.vessel}</strong></div><div><small>Inspetor</small><strong>{assignment.inspectorName}</strong></div><div><small>Progresso</small><strong>{answeredCount} de {requiredQuestions.length} obrigatórias</strong></div></div>
    <form className={styles.runForm} onSubmit={submit}>
      <div className={styles.runSectionHeader}><div><span className={styles.sectionIcon}><ShieldCheck size={16}/></span><div><h2>Roteiro de inspeção</h2><p>Preencha cada item antes de concluir.</p></div></div><span className={styles.questionTotal}>{template.questions.length} perguntas</span></div>
      <div className={styles.answerList}>{template.questions.map((question, index) => <section className={styles.answerCard} key={question.id}><div className={styles.answerNumber}>{String(index + 1).padStart(2, '0')}</div><QuestionField question={question} value={answers[question.id] ?? ''} disabled={readOnly} onChange={value => saveAnswer(question.id, value)}/></section>)}</div>
      {template.allowPhotos && <section className={styles.photoSection}><div className={styles.photoHeader}><div><h2>Fotos de evidência</h2><p>Adicione imagens do local ou dos itens inspecionados (até 4 fotos, 4 MB cada).</p></div><span className={styles.photoCounter}>{assignment.photos.length}/4</span></div>
        {!readOnly && assignment.photos.length < 4 && <label className={styles.uploadArea}><input type="file" accept="image/*" multiple onChange={addPhotos} disabled={uploading}/><ImagePlus size={20}/><span><strong>{uploading ? 'Carregando imagens…' : 'Selecionar imagens'}</strong><small>JPG, PNG ou outro formato de imagem</small></span><Upload size={16}/></label>}
        {assignment.photos.length > 0 && <div className={styles.photoGrid}>{assignment.photos.map((photo, index) => <figure key={photo.id} className={styles.photoItem}><img src={photo.dataUrl} alt={`Evidência ${index + 1}: ${photo.name}`}/><figcaption>{photo.name}</figcaption>{!readOnly && <button type="button" aria-label={`Remover ${photo.name}`} onClick={() => removePhoto(photo.id)}><X size={14}/></button>}</figure>)}</div>}
      </section>}
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <footer className={styles.runActions}><span>{readOnly ? `Concluída em ${assignment.completedAt ?? '—'}` : 'As respostas ficam salvas durante esta sessão.'}</span>{!readOnly && <button type="submit" className="primary-btn"><Check size={15}/> Concluir inspeção</button>}</footer>
    </form>
  </section>
}
