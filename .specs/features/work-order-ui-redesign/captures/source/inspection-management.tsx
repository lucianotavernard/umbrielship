'use client'

import { useMemo, useState } from 'react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { useTeamStore } from '@/components/teams/team-store'
import { ClipboardCheck, ClipboardList, Clock3, FilePlus2, Image, Plus, ShieldCheck, UserRound, Users } from 'lucide-react'
import { InspectionAssignmentForm, InspectionTemplateForm } from './inspection-forms'
import { InspectionRun } from './inspection-run'
import { useInspectionStore, type InspectionAssignment, type InspectionTemplate } from './inspection-store'
import styles from './inspection.module.css'

export function InspectionManagement() {
  const { technicians } = useTeamStore()
  const { templates, assignments, createTemplate, createAssignment, updateAssignment } = useInspectionStore()
  const [view, setView] = useState<'admin' | 'inspector'>('admin')
  const [tab, setTab] = useState<'templates' | 'assignments'>('templates')
  const [activeInspectorId, setActiveInspectorId] = useState('tech-2')
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [assigningTemplate, setAssigningTemplate] = useState<InspectionTemplate | null>(null)
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const activeAssignment = assignments.find(assignment => assignment.id === activeAssignmentId)
  const activeTemplate = activeAssignment && templates.find(template => template.id === activeAssignment.templateId)
  const selectedInspector = technicians.find(person => person.id === activeInspectorId)
  const visibleAssignments = useMemo(() => view === 'inspector' ? assignments.filter(assignment => assignment.inspectorId === activeInspectorId) : assignments, [assignments, view, activeInspectorId])
  const pendingCount = assignments.filter(assignment => assignment.status !== 'Concluída').length
  const completedCount = assignments.filter(assignment => assignment.status === 'Concluída').length

  function saveTemplate(template: InspectionTemplate) {
    createTemplate(template)
    setShowTemplateForm(false)
    setTab('templates')
    setNotice(`Template “${template.title}” criado.`)
  }

  function assignTemplate(order: { id: string; vessel: string }, inspector: { id: string; name: string }) {
    if (!assigningTemplate) return
    const assignment: InspectionAssignment = { id: crypto.randomUUID(), templateId: assigningTemplate.id, orderId: order.id, vessel: order.vessel, inspectorId: inspector.id, inspectorName: inspector.name, status: 'Pendente', answers: {}, photos: [], assignedAt: new Date().toLocaleString('pt-BR') }
    createAssignment(assignment)
    setAssigningTemplate(null)
    setTab('assignments')
    setView('admin')
    setNotice(`${order.id} atribuída a ${inspector.name}.`)
  }

  function openAssignment(assignment: InspectionAssignment) {
    if (assignment.status === 'Pendente') updateAssignment(assignment.id, { status: 'Em andamento' })
    setActiveAssignmentId(assignment.id)
  }

  function closeRun() {
    setActiveAssignmentId(null)
    setTab('assignments')
  }

  return <div className="app-shell">
    <AppSidebar activePage="inspections"/>
    <main className="main-area">
      <AppTopbar section="Inspeções"/>
      <div className={`page-content ${styles.page}`}>
        {activeAssignment && activeTemplate ? <InspectionRun assignment={activeAssignment} template={activeTemplate} onBack={closeRun}/> : <>
          <header className={styles.pageHeading}><div><div className="eyebrow"><span className="eyebrow-line"/>OPERAÇÃO / QUALIDADE</div><h1>Inspeções</h1><p className="subtitle">Crie roteiros, atribua ordens e acompanhe as inspeções de campo.</p></div><div className={styles.headingActions}><div className={styles.viewSwitch} role="group" aria-label="Alternar visualização"><button type="button" className={view === 'admin' ? styles.viewActive : ''} aria-pressed={view === 'admin'} onClick={() => setView('admin')}><Users size={14}/> Gestão</button><button type="button" className={view === 'inspector' ? styles.viewActive : ''} aria-pressed={view === 'inspector'} onClick={() => setView('inspector')}><ShieldCheck size={14}/> Inspetor</button></div>{view === 'admin' && <button type="button" className="primary-btn" onClick={() => setShowTemplateForm(true)}><Plus size={16}/> Novo template</button>}</div></header>
          {view === 'inspector' && <div className={styles.inspectorNotice}><ShieldCheck size={16}/><span>Visualização de demonstração do inspetor. Escolha um profissional para ver as inspeções atribuídas.</span><label>Inspetor<select aria-label="Selecionar inspetor" value={activeInspectorId} onChange={event => setActiveInspectorId(event.target.value)}>{technicians.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label></div>}
          {notice && <div className={styles.notice} role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}
          <section className={styles.metrics} aria-label="Resumo de inspeções"><article><span className={styles.metricIcon}><ClipboardList size={17}/></span><div><small>Templates ativos</small><strong>{String(templates.length).padStart(2, '0')}</strong></div><span className={styles.metricNote}>roteiros</span></article><article><span className={`${styles.metricIcon} ${styles.amber}`}><Clock3 size={17}/></span><div><small>Aguardando conclusão</small><strong>{String(pendingCount).padStart(2, '0')}</strong></div><span className={styles.metricNote}>atribuições</span></article><article><span className={`${styles.metricIcon} ${styles.green}`}><ClipboardCheck size={17}/></span><div><small>Concluídas</small><strong>{String(completedCount).padStart(2, '0')}</strong></div><span className={styles.metricNote}>inspeções</span></article></section>
          <section className={styles.panel} aria-labelledby="inspection-list-title"><div className={styles.panelHeader}><div><h2 id="inspection-list-title">{view === 'inspector' ? `Inspeções de ${selectedInspector?.name ?? 'inspetor'}` : 'Central de inspeções'}</h2><p>{view === 'inspector' ? 'Abra uma ordem para preencher o roteiro em campo.' : 'Gerencie os modelos e acompanhe as execuções por ordem de serviço.'}</p></div></div>
            {view === 'admin' ? <div className={styles.tabs} role="tablist" aria-label="Seções de inspeções"><button type="button" role="tab" aria-selected={tab === 'templates'} className={tab === 'templates' ? styles.tabActive : ''} onClick={() => setTab('templates')}>Templates<span>{templates.length}</span></button><button type="button" role="tab" aria-selected={tab === 'assignments'} className={tab === 'assignments' ? styles.tabActive : ''} onClick={() => setTab('assignments')}>Atribuições<span>{assignments.length}</span></button></div> : null}
            {view === 'admin' && tab === 'templates' ? <div className={styles.templateGrid}>{templates.map(template => <article key={template.id} className={styles.templateCard}><div className={styles.templateCardTop}><span className={styles.templateIcon}><FilePlus2 size={17}/></span><span className={styles.templateType}>TEMPLATE</span></div><h3>{template.title}</h3><p>{template.description || 'Sem descrição adicional.'}</p><div className={styles.templateMeta}><span><ClipboardCheck size={13}/>{template.questions.length} perguntas</span><span>{template.allowPhotos ? <><Image size={13}/>Fotos permitidas</> : 'Sem fotos'}</span></div><footer><span>Criado em {template.createdAt}</span><button type="button" onClick={() => setAssigningTemplate(template)}>Atribuir à OS</button></footer></article>)}<button type="button" className={styles.newTemplateCard} onClick={() => setShowTemplateForm(true)}><span><Plus size={19}/></span><strong>Criar outro template</strong><small>Monte um roteiro para uma nova rotina de inspeção</small></button></div> : null}
            {(view === 'inspector' || (view === 'admin' && tab === 'assignments')) && <div className={styles.assignmentList}>{visibleAssignments.length ? visibleAssignments.map(assignment => {
              const template = templates.find(item => item.id === assignment.templateId)
              const completed = assignment.status === 'Concluída'
              return <article className={styles.assignmentCard} key={assignment.id}><div className={`${styles.assignmentIcon} ${completed ? styles.assignmentComplete : ''}`}>{completed ? <ClipboardCheck size={17}/> : <ShieldCheck size={17}/>}</div><div className={styles.assignmentInfo}><div className={styles.assignmentEyebrow}>{assignment.orderId} · {assignment.vessel}</div><h3>{template?.title ?? 'Template removido'}</h3><p><UserRound size={13}/>{assignment.inspectorName}<span>·</span>{template?.questions.length ?? 0} perguntas{template?.allowPhotos ? <><span>·</span><Image size={13}/> Fotos</> : null}</p></div><span className={`${styles.statusPill} ${completed ? styles.statusDone : assignment.status === 'Em andamento' ? styles.statusInProgress : styles.statusPending}`}>{assignment.status}</span><button type="button" className={styles.openAssignment} onClick={() => openAssignment(assignment)}>{completed ? 'Ver respostas' : view === 'inspector' ? 'Iniciar inspeção' : 'Abrir inspeção'}</button></article>
            }) : <div className={styles.emptyState}><ShieldCheck size={22}/><strong>Nenhuma inspeção atribuída</strong><span>Quando uma ordem for atribuída a este inspetor, ela aparecerá aqui.</span></div>}</div>}
          </section>
          <footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><span>Templates de inspeção</span></footer>
        </>}
      </div>
    </main>
    {showTemplateForm && <InspectionTemplateForm onClose={() => setShowTemplateForm(false)} onSave={saveTemplate}/>}
    {assigningTemplate && <InspectionAssignmentForm template={assigningTemplate} onClose={() => setAssigningTemplate(null)} onSave={assignTemplate}/>}
  </div>
}
