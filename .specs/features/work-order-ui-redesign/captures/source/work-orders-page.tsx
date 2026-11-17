'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ClientCreateDrawer } from '@/components/clients/client-create-drawer'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useClientStore } from '@/components/clients/client-store'
import { Anchor, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList, Clock3, Download, LayoutDashboard, LifeBuoy, Menu, MoreHorizontal, Plus, Search, Ship, SlidersHorizontal, Users, Wrench, X } from 'lucide-react'

const workOrders = [
  { id: 'OS-2481', boat: 'Santa Maria', owner: 'Marcos Oliveira', service: 'Revisão do motor principal', category: 'Motor', team: 'Equipe Alfa', initials: 'MO', due: 'Hoje, 14:30', created: '17 jun, 09:12', status: 'Em andamento', priority: 'Alta', color: 'blue' },
  { id: 'OS-2480', boat: 'Lula Branca', owner: 'Pescados Atlântico', service: 'Troca do sistema hidráulico', category: 'Hidráulica', team: 'Equipe Bravo', initials: 'PA', due: 'Hoje, 16:00', created: '17 jun, 08:40', status: 'Aguardando peça', priority: 'Urgente', color: 'purple' },
  { id: 'OS-2479', boat: 'Maré Alta', owner: 'Roberto Nunes', service: 'Inspeção elétrica e sonar', category: 'Elétrica', team: 'Equipe Alfa', initials: 'RN', due: 'Amanhã, 09:00', created: '16 jun, 15:22', status: 'Agendada', priority: 'Normal', color: 'green' },
  { id: 'OS-2478', boat: 'Estrela do Sul', owner: 'Pesca Forte Ltda.', service: 'Manutenção do guincho de rede', category: 'Mecânica', team: 'Equipe Charlie', initials: 'PF', due: 'Amanhã, 11:30', created: '16 jun, 13:05', status: 'Em andamento', priority: 'Alta', color: 'orange' },
  { id: 'OS-2477', boat: 'São Pedro II', owner: 'André Carvalho', service: 'Reparo na bomba de porão', category: 'Motor', team: 'Equipe Bravo', initials: 'AC', due: '18 jun, 15:00', created: '16 jun, 10:18', status: 'Aguardando aprovação', priority: 'Normal', color: 'teal' },
  { id: 'OS-2476', boat: 'Vento Leste', owner: 'Cooperativa Mar Azul', service: 'Revisão preventiva do motor', category: 'Motor', team: 'Equipe Alfa', initials: 'MA', due: '19 jun, 08:30', created: '15 jun, 16:45', status: 'Agendada', priority: 'Normal', color: 'blue' },
  { id: 'OS-2475', boat: 'Pescador I', owner: 'João Batista', service: 'Substituição de hélice', category: 'Propulsão', team: 'Equipe Charlie', initials: 'JB', due: '19 jun, 13:00', created: '15 jun, 11:24', status: 'Concluída', priority: 'Baixa', color: 'orange' },
  { id: 'OS-2474', boat: 'Rainha do Mar', owner: 'Náutica Costa Sul', service: 'Calibração do radar', category: 'Eletrônica', team: 'Equipe Bravo', initials: 'CS', due: '20 jun, 10:00', created: '14 jun, 14:10', status: 'Concluída', priority: 'Normal', color: 'purple' },
]
const statusStyles: Record<string, string> = { 'Em andamento': 'blue', 'Aguardando peça': 'amber', 'Aguardando aprovação': 'rose', Agendada: 'gray', Concluída: 'green' }
type ServiceDraft = { category: string; description: string }
const emptyService = (): ServiceDraft => ({ category: '', description: '' })

function Sidebar() {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark"><Anchor size={19}/></span><span className="brand-name">MARÉ<span>OS</span></span><button className="collapse" aria-label="Recolher menu"><ChevronLeft size={16}/></button></div><div className="workspace"><span className="workspace-icon">N</span><span><strong>Náutica Costa Sul</strong><small>Oficina principal</small></span><ChevronDown size={14} className="workspace-chevron"/></div><div className="nav-label">MENU PRINCIPAL</div><nav aria-label="Navegação principal"><Link className="nav-link" href="/"><LayoutDashboard size={17}/><span>Visão geral</span></Link><Link className="nav-link active" href="/ordens-servico"><ClipboardList size={17}/><span>Ordens de serviço</span><span className="nav-count">12</span></Link><a className="nav-link" href="#embarcacoes"><Ship size={17}/><span>Embarcações</span></a><a className="nav-link" href="#agenda"><CalendarDays size={17}/><span>Agenda</span></a><a className="nav-link" href="#equipe"><Users size={17}/><span>Equipe técnica</span></a><a className="nav-link" href="#estoque"><Wrench size={17}/><span>Estoque e peças</span></a></nav><div className="nav-label tools-label">GESTÃO</div><nav><a className="nav-link" href="#relatorios"><SlidersHorizontal size={17}/><span>Relatórios</span></a></nav><div className="sidebar-bottom"><div className="help-card"><LifeBuoy size={17} className="help-icon"/><strong>Precisa de ajuda?</strong><p>Fale com nosso time de suporte.</p><button>Falar com suporte <ChevronRight size={14}/></button></div><div className="profile"><div className="avatar profile-avatar">LC</div><span><strong>Lucas Costa</strong><small>Administrador</small></span><MoreHorizontal size={19} className="profile-more"/></div></div></aside>
}

export default function WorkOrdersPage() {
  const { clients } = useClientStore()
  const [orders, setOrders] = useState(workOrders)
  const [status, setStatus] = useState('Todas')
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('Todas as prioridades')
  const [showPriority, setShowPriority] = useState(false)
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)
  const newClientButtonRef = useRef<HTMLButtonElement>(null)
  const [form, setForm] = useState({ boat: '', owner: '', services: [emptyService()], team: '', due: '', priority: 'Normal' })
  const openerRef = useRef<HTMLButtonElement>(null)
  const firstFieldRef = useRef<HTMLSelectElement>(null)
  const filteredOrders = useMemo(() => orders.filter(order => (status === 'Todas' || order.status === status) && (priority === 'Todas as prioridades' || order.priority === priority) && `${order.id} ${order.boat} ${order.owner} ${order.service} ${order.team}`.toLowerCase().includes(query.toLowerCase())), [orders, status, priority, query])
  const allVisibleSelected = filteredOrders.length > 0 && filteredOrders.every(order => selectedOrderIds.includes(order.id))
  const partiallyVisibleSelected = filteredOrders.some(order => selectedOrderIds.includes(order.id)) && !allVisibleSelected
  const statusTabs = ['Todas', 'Em andamento', 'Aguardando peça', 'Agendada', 'Concluída']
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partiallyVisibleSelected
  }, [partiallyVisibleSelected])
  useEffect(() => {
    if (!drawerOpen) return
    firstFieldRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (clientDrawerOpen) {
          setClientDrawerOpen(false)
          window.setTimeout(() => newClientButtonRef.current?.focus(), 0)
        } else closeDrawer()
      }
      if (event.key === 'Tab' && !clientDrawerOpen) {
        const focusable = document.querySelectorAll<HTMLElement>('.workorder-drawer button:not([disabled]), .workorder-drawer input:not([disabled]), .workorder-drawer select:not([disabled]), .workorder-drawer textarea:not([disabled])')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, clientDrawerOpen])
  function openDrawer() {
    setNotice('')
    setDrawerOpen(true)
  }
  function closeDrawer() {
    setClientDrawerOpen(false)
    setDrawerOpen(false)
    window.setTimeout(() => openerRef.current?.focus(), 0)
  }
  function updateService(index: number, field: keyof ServiceDraft, value: string) {
    setForm(current => ({ ...current, services: current.services.map((service, serviceIndex) => serviceIndex === index ? { ...service, [field]: value } : service) }))
  }
  function addService() {
    setForm(current => ({ ...current, services: [...current.services, emptyService()] }))
  }
  function removeService(index: number) {
    setForm(current => ({ ...current, services: current.services.filter((_, serviceIndex) => serviceIndex !== index) }))
  }
  function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextId = `OS-${String(2482 + orders.length - workOrders.length).padStart(4, '0')}`
    const dueDate = new Date(`${form.due}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    const initials = form.owner.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
    const serviceDescription = form.services.map(service => service.description.trim()).join(' · ')
    const serviceCategories = form.services.map(service => service.category).join(', ')
    setOrders(current => [{ id: nextId, boat: form.boat, owner: form.owner, service: serviceDescription, category: serviceCategories, team: form.team, initials, due: dueDate, created: 'Agora', status: 'Agendada', priority: form.priority, color: 'teal' }, ...current])
    setStatus('Todas')
    setPriority('Todas as prioridades')
    setQuery('')
    setPage(1)
    setForm({ boat: '', owner: '', services: [emptyService()], team: '', due: '', priority: 'Normal' })
    setDrawerOpen(false)
    setNotice(`${nextId} criada com sucesso e adicionada à lista.`)
    window.setTimeout(() => openerRef.current?.focus(), 0)
  }
  function toggleOrderSelection(orderId: string) {
    setSelectedOrderIds(current => current.includes(orderId) ? current.filter(id => id !== orderId) : [...current, orderId])
  }
  function toggleVisibleOrders() {
    const visibleIds = filteredOrders.map(order => order.id)
    setSelectedOrderIds(current => allVisibleSelected
      ? current.filter(id => !visibleIds.includes(id))
      : Array.from(new Set([...current, ...visibleIds])))
  }
  function exportOrders() {
    const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id))
    const csvCell = (value: string) => {
      const safeValue = /^[\t\n\r ]*[=+\-@]/.test(value) ? `'${value}` : value
      return `"${safeValue.replaceAll('"', '""')}"`
    }
    const rows = [
      ['OS', 'Embarcação', 'Cliente', 'Serviço', 'Categoria', 'Equipe', 'Prazo', 'Data de abertura', 'Prioridade', 'Status'],
      ...selectedOrders.map(order => [order.id, order.boat, order.owner, order.service, order.category, order.team, order.due, order.created, order.priority, order.status]),
    ]
    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'ordens-de-servico.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return <div className="app-shell"><AppSidebar activePage="orders"/><main className="main-area"><header className="topbar"><div className="breadcrumb"><SidebarTrigger className="mobile-menu" aria-label="Abrir menu"/><span>Operação</span><ChevronRight size={14}/><strong>Ordens de serviço</strong></div><div className="top-actions"><span className="today-label"><span className="live-dot"/>Oficina em operação</span><button className="icon-btn" aria-label="Ajuda"><CircleHelp size={18}/></button><button className="icon-btn notification" aria-label="Notificações"><Bell size={18}/><i/></button><div className="top-divider"/><div className="avatar top-avatar">LC</div></div></header>
    <div className="page-content workorders-content"><div className="orders-page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>OPERAÇÃO / SERVIÇOS</div><h1>Ordens de serviço</h1><p className="subtitle">Gerencie os serviços e acompanhe cada embarcação da sua frota.</p></div><button ref={openerRef} type="button" className="primary-btn" onClick={openDrawer}><Plus size={17}/> Nova ordem de serviço</button></div>
    <section className="workorder-metrics" aria-label="Resumo das ordens"><article className="workorder-metric"><span className="metric-icon metric-total"><ClipboardList size={17}/></span><div><span>Total de ordens</span><strong>24</strong></div><small>no período</small></article><article className="workorder-metric"><span className="metric-icon metric-progress"><Wrench size={17}/></span><div><span>Em andamento</span><strong>08</strong></div><small className="metric-green"><i/> 4 equipes ativas</small></article><article className="workorder-metric"><span className="metric-icon metric-pending"><Clock3 size={17}/></span><div><span>Aguardando ação</span><strong>05</strong></div><small className="metric-amber">Peças ou aprovação</small></article><article className="workorder-metric"><span className="metric-icon metric-done"><Check size={17}/></span><div><span>Concluídas no mês</span><strong>37</strong></div><small className="metric-green">92% no prazo</small></article></section>
    {notice&&<div className="workorder-notice" role="status"><span><CircleHelp size={16}/>{notice}</span><button aria-label="Fechar aviso" onClick={()=>setNotice('')}><X size={16}/></button></div>}
    <section className="panel workorders-table-panel"><div className="workorders-toolbar"><div><h2>Lista de ordens</h2><p>Visualize prazos, responsáveis e andamento dos serviços.</p></div><div className="order-actions"><button className="outline-btn export-btn" onClick={exportOrders} disabled={selectedOrderIds.length === 0} aria-label={selectedOrderIds.length ? `Exportar ${selectedOrderIds.length} ordens selecionadas em CSV` : 'Selecione ordens para exportar'}><Download size={15}/> Exportar{selectedOrderIds.length > 0 ? ` (${selectedOrderIds.length})` : ''}</button><div className="priority-filter"><button className="outline-btn" aria-expanded={showPriority} onClick={()=>setShowPriority(!showPriority)}><SlidersHorizontal size={15}/> Prioridade <ChevronDown size={13}/></button>{showPriority&&<div className="priority-menu" role="group" aria-label="Filtrar por prioridade">{['Todas as prioridades','Urgente','Alta','Normal','Baixa'].map(item=><button key={item} className={priority===item?'chosen':''} onClick={()=>{setPriority(item);setShowPriority(false);setPage(1)}}>{item}{priority===item&&<Check size={13}/>}</button>)}</div>}</div></div></div>
    <div className="workorders-filters"><div className="workorder-tabs" role="tablist" aria-label="Filtrar ordens por status">{statusTabs.map(tab=><button key={tab} role="tab" aria-selected={status===tab} className={status===tab?'chosen':''} onClick={()=>{setStatus(tab);setPage(1)}}>{tab}<span>{tab==='Todas'?24:tab==='Em andamento'?8:tab==='Aguardando peça'?3:tab==='Agendada'?6:7}</span></button>)}</div><label className="workorder-search"><Search size={15}/><input aria-label="Buscar ordem, embarcação ou cliente" placeholder="Buscar ordem, embarcação ou cliente..." value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}}/>{query&&<button type="button" aria-label="Limpar busca" onClick={()=>setQuery('')}><X size={13}/></button>}</label></div>
    <div className="workorders-table-wrap"><table className="workorders-table"><thead><tr><th className="order-select-cell"><input ref={selectAllRef} className="order-select-checkbox" type="checkbox" aria-label="Selecionar todas as ordens visíveis" checked={allVisibleSelected} onChange={toggleVisibleOrders}/></th><th>ORDEM / EMBARCAÇÃO</th><th>SERVIÇO</th><th>EQUIPE RESPONSÁVEL</th><th>PRAZO</th><th>PRIORIDADE</th><th>STATUS</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filteredOrders.map(order=><tr key={order.id} className={selectedOrderIds.includes(order.id)?'is-selected':''}><td className="order-select-cell"><input className="order-select-checkbox" type="checkbox" aria-label={`Selecionar ordem ${order.id}`} checked={selectedOrderIds.includes(order.id)} onChange={()=>toggleOrderSelection(order.id)}/></td><td><div className="boat-cell"><div className={`boat-avatar ${order.color}`}><Ship size={16}/></div><div><strong>{order.boat}</strong><span>{order.id} · {order.owner}</span></div></div></td><td><span className="workorder-service">{order.service}</span><span className="service-category">{order.category}</span></td><td><span className="team-pill"><span className="mini-team">{order.initials}</span>{order.team}</span></td><td><span className="due-cell"><Clock3 size={13}/>{order.due}</span><span className="created-date">Aberta em {order.created}</span></td><td><span className={`priority-badge ${order.priority.toLowerCase()}`}><i/>{order.priority}</span></td><td><span className={`status-badge ${statusStyles[order.status]}`}><i/>{order.status}</span></td><td><button className="dots" aria-label={`Ações para ${order.id}`} onClick={()=>setNotice(`Ações disponíveis para ${order.id}: visualizar detalhes, editar ou encerrar ordem.`)}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{filteredOrders.length===0&&<div className="empty-state">Nenhuma ordem corresponde aos filtros aplicados.</div>}</div>
    <div className="workorders-footer"><span>Exibindo <strong>{filteredOrders.length?((page-1)*8)+1:0}–{Math.min(page*8,filteredOrders.length)}</strong> de <strong>{filteredOrders.length}</strong> ordens</span><div className="pagination"><button aria-label="Página anterior" disabled={page===1} onClick={()=>setPage(Math.max(1,page-1))}><ChevronLeft size={15}/></button><button className="page-current">{page}</button><button onClick={()=>setPage(page+1)}>{page+1}</button><button aria-label="Próxima página" onClick={()=>setPage(page+1)}><ChevronRight size={15}/></button></div></div></section><footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><span>Última atualização há 2 min <span className="live-dot"/></span></footer></div></main>{drawerOpen&&<div className="drawer-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)closeDrawer()}}><aside className="workorder-drawer" role="dialog" aria-modal="true" aria-labelledby="new-order-title" aria-describedby="new-order-description"><header className="drawer-header"><div><div className="drawer-kicker">NOVA SOLICITAÇÃO</div><h2 id="new-order-title">Nova ordem de serviço</h2><p id="new-order-description">Preencha os dados dos serviços para programar o atendimento da embarcação.</p></div><button type="button" className="drawer-close" aria-label="Fechar formulário" onClick={closeDrawer}><X size={18}/></button></header><form className="new-order-form" onSubmit={createOrder}><div className="drawer-sections"><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><Ship size={17}/></span><span><strong>Embarcação e cliente</strong><small>Identifique a embarcação atendida</small></span></header><div className="form-card-fields"><label className="form-field"><span>Embarcação <b>*</b></span><select ref={firstFieldRef} required value={form.boat} onChange={event=>setForm({...form,boat:event.target.value})}><option value="" disabled>Selecione uma embarcação</option>{[...new Set(orders.map(order=>order.boat))].map(boat=><option key={boat} value={boat}>{boat}</option>)}</select></label><div className="client-select-field"><label htmlFor="order-owner"><span>Cliente responsável <b>*</b></span></label><div className="client-select-row"><select id="order-owner" required value={form.owner} onChange={event=>setForm(current=>({...current,owner:event.target.value}))}><option value="" disabled>Selecione um cliente</option>{[...clients].sort((first,second)=>first.name.localeCompare(second.name,'pt-BR')).map(client=><option key={client.id} value={client.name}>{client.name}</option>)}</select><button ref={newClientButtonRef} type="button" className="add-client-inline-btn" aria-haspopup="dialog" aria-controls="new-client-drawer-title" onClick={()=>setClientDrawerOpen(true)}><Plus size={13}/> Adicionar cliente</button></div></div></div></section><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><Wrench size={17}/></span><span><strong>Serviços a realizar</strong><small>Adicione um ou mais serviços para esta embarcação</small></span></header><div className="form-card-fields services-fields">{form.services.map((service,index)=><div className="service-entry" key={index} aria-label={`Serviço ${index + 1}`}><div className="service-entry-heading"><strong>Serviço {index + 1}</strong>{form.services.length>1&&<button type="button" className="remove-service-btn" aria-label={`Remover serviço ${index + 1}`} onClick={()=>removeService(index)}><X size={14}/></button>}</div><div className="service-entry-fields"><label className="form-field"><span>Tipo de serviço <b>*</b></span><select required value={service.category} onChange={event=>updateService(index,'category',event.target.value)}><option value="" disabled>Selecione uma categoria</option>{['Motor','Hidráulica','Elétrica','Mecânica','Propulsão','Eletrônica','Casco'].map(item=><option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Descrição do serviço <b>*</b></span><textarea required rows={3} maxLength={240} value={service.description} onChange={event=>updateService(index,'description',event.target.value)} placeholder="Ex.: Revisão do motor principal e troca de filtros"/></label></div></div>)}<button type="button" className="add-service-btn" onClick={addService}><Plus size={14}/> Adicionar serviço</button></div></section><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><CalendarDays size={17}/></span><span><strong>Planejamento</strong><small>Defina prazo, prioridade e equipe técnica</small></span></header><div className="form-card-fields form-grid"><label className="form-field"><span>Equipe responsável <b>*</b></span><select required value={form.team} onChange={event=>setForm({...form,team:event.target.value})}><option value="" disabled>Selecione a equipe</option>{['Equipe Alfa','Equipe Bravo','Equipe Charlie'].map(item=><option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Prazo previsto <b>*</b></span><input type="date" required value={form.due} onChange={event=>setForm({...form,due:event.target.value})}/></label><label className="form-field"><span>Prioridade</span><select value={form.priority} onChange={event=>setForm({...form,priority:event.target.value})}>{['Baixa','Normal','Alta','Urgente'].map(item=><option key={item}>{item}</option>)}</select></label></div></section></div><footer className="drawer-footer"><span className="required-note"><b>*</b> Campos obrigatórios</span><div className="drawer-actions"><button type="button" className="outline-btn" onClick={closeDrawer}><X size={14}/> Cancelar</button><button type="submit" className="primary-btn"><Check size={15}/> Criar ordem</button></div></footer></form></aside></div>}{drawerOpen && clientDrawerOpen && <ClientCreateDrawer open={true} onClose={() => { setClientDrawerOpen(false); window.setTimeout(() => newClientButtonRef.current?.focus(), 0) }} onCreated={client => { setForm(current => ({ ...current, owner: client.name })); setClientDrawerOpen(false); window.setTimeout(() => newClientButtonRef.current?.focus(), 0) }}/>}</div>
}
