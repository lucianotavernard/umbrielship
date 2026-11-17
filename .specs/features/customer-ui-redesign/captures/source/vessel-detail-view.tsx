'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, ChevronRight, FileText, Info, MapPin, Pencil, Plus, Ruler, Ship, X } from 'lucide-react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { VesselDrawer, type Vessel, type VesselFormValues, type VesselStatus } from '@/components/vessels/vessel-drawer'
import { useVesselStore } from '@/components/vessels/vessel-store'

type ServiceOrder = {
  id: string
  docking: string
  undocking: string
  status: 'Em andamento' | 'Concluída' | 'Agendada'
  service?: string
  category?: string
  team?: string
  priority?: string
}

const sampleOrders: Record<string, ServiceOrder[]> = {
  'EMB-0001': [{ id: '#5FBE9F04', docking: '2026-11-10T12:00:00Z', undocking: '2026-11-15T12:00:00Z', status: 'Em andamento' }],
}

const statusStyles: Record<VesselStatus, string> = { Ativa: 'active', 'Em manutenção': 'maintenance', Inativa: 'inactive' }
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

export function VesselDetailView({ initialVessel }: { initialVessel: Vessel }) {
  const { setVessels } = useVesselStore()
  const [vessel, setVessel] = useState(initialVessel)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false)
  const [orders, setOrders] = useState<ServiceOrder[]>(sampleOrders[initialVessel.id] ?? [])
  const [orderForm, setOrderForm] = useState({ service: '', category: '', team: '', docking: '', undocking: '', priority: 'Normal' })
  const [orderNotice, setOrderNotice] = useState('')
  const orderButtonRef = useRef<HTMLButtonElement>(null)
  const firstOrderFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!orderDrawerOpen) return
    firstOrderFieldRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOrderDrawerOpen(false)
        window.setTimeout(() => orderButtonRef.current?.focus(), 0)
      }
      if (event.key === 'Tab') {
        const focusable = document.querySelectorAll<HTMLElement>('.workorder-drawer button:not([disabled]), .workorder-drawer input:not([disabled]), .workorder-drawer select:not([disabled])')
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
  }, [orderDrawerOpen])

  function openOrderDrawer() {
    setOrderNotice('')
    setOrderForm({ service: '', category: '', team: '', docking: '', undocking: '', priority: 'Normal' })
    setOrderDrawerOpen(true)
  }

  function closeOrderDrawer() {
    setOrderDrawerOpen(false)
    window.setTimeout(() => orderButtonRef.current?.focus(), 0)
  }

  function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const orderId = `#OS-${String(2482 + orders.length).padStart(4, '0')}`
    setOrders(current => [{
      id: orderId,
      docking: new Date(`${orderForm.docking}T12:00:00`).toISOString(),
      undocking: new Date(`${orderForm.undocking}T12:00:00`).toISOString(),
      status: 'Agendada',
      service: orderForm.service,
      category: orderForm.category,
      team: orderForm.team,
      priority: orderForm.priority,
    }, ...current])
    setOrderDrawerOpen(false)
    setOrderNotice(`${orderId} criada para ${vessel.name}.`)
    window.setTimeout(() => orderButtonRef.current?.focus(), 0)
  }

  function saveVessel(values: VesselFormValues) {
    const updatedVessel = { ...values, id: vessel.id }
    setVessel(updatedVessel)
    setVessels(current => current.map(item => item.id === vessel.id ? updatedVessel : item))
    setDrawerOpen(false)
  }

  return <div className="app-shell"><AppSidebar activePage="vessels"/><main className="main-area"><AppTopbar section="Embarcações"/><div className="page-content vessels-content vessel-detail-content">
    <nav className="vessel-detail-breadcrumb" aria-label="Navegação estrutural"><Link href="/embarcacoes"><ArrowLeft size={15}/>Voltar à frota</Link><ChevronRight size={14}/><span>{vessel.name}</span></nav>
    <div className="vessel-detail-grid">
      <div className="vessel-detail-main-column">
        <section className="panel vessel-profile-panel" aria-labelledby="vessel-detail-title">
          <div className="vessel-profile-heading"><span className={`vessel-profile-icon ${vessel.status === 'Ativa' ? 'teal' : vessel.status === 'Em manutenção' ? 'orange' : 'blue'}`}><Ship size={22}/></span><div className="vessel-profile-copy"><span className="vessel-detail-kicker">FROTA / {vessel.id}</span><div className="vessel-profile-title"><h1 id="vessel-detail-title">{vessel.name}</h1><span className="vessel-type-pill">{vessel.type}</span></div><p>Informações cadastrais e operacionais da embarcação.</p></div><div className="vessel-profile-actions"><span className={`vessel-status-badge ${statusStyles[vessel.status]}`}><i/>{vessel.status}</span><button type="button" className="vessel-detail-edit" onClick={() => setDrawerOpen(true)}><Pencil size={14}/>Editar</button></div></div>
          <dl className="vessel-spec-grid"><div><dt>Número IMO</dt><dd>{vessel.imo || 'Não informado'}</dd></div><div><dt>Comprimento</dt><dd><Ruler size={14}/>{vessel.length.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} m</dd></div><div><dt>Porto base</dt><dd><MapPin size={14}/>{vessel.port || 'Não informado'}</dd></div></dl>
        </section>
        <section className="panel vessel-detail-orders" aria-labelledby="vessel-orders-title">
          <div className="vessel-detail-section-heading"><div><h2 id="vessel-orders-title">Ordens de serviço</h2><p>Ordens vinculadas a esta embarcação.</p></div><button ref={orderButtonRef} type="button" className="vessel-new-order-btn" onClick={openOrderDrawer}><Plus size={15}/>Nova ordem</button></div>
          {orderNotice && <div className="workorder-notice" role="status">{orderNotice}</div>}
          {orders.length > 0 ? <div className="vessel-orders-table-wrap"><table className="vessel-orders-table"><thead><tr><th>Ordem</th><th>Docagem</th><th>Desdocagem</th><th>Status</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><Link href="/ordens-servico" className="vessel-order-id"><FileText size={15}/>{order.id}</Link>{order.service && <span className="service-category">{order.service}{order.category ? ` · ${order.category}` : ''}{order.team ? ` · ${order.team}` : ''}</span>}</td><td><span className="vessel-date-cell"><CalendarDays size={14}/>{dateFormatter.format(new Date(order.docking))}</span></td><td><span className="vessel-date-cell"><CalendarDays size={14}/>{dateFormatter.format(new Date(order.undocking))}</span></td><td><span className={`status-badge ${order.status === 'Em andamento' ? 'blue' : 'gray'}`}><i/>{order.status}</span></td></tr>)}</tbody></table></div> : <div className="vessel-orders-empty"><span><FileText size={17}/></span><strong>Nenhuma ordem vinculada</strong><p>As ordens de serviço desta embarcação aparecerão aqui.</p></div>}
        </section>
      </div>
      <aside className="panel vessel-client-panel" aria-labelledby="vessel-client-title">
        <div className="vessel-client-heading"><div className="vessel-client-avatar">{getInitials(vessel.owner)}</div><div><span className="vessel-detail-kicker">CLIENTE RESPONSÁVEL</span><h2 id="vessel-client-title">{vessel.owner}</h2><p>{vessel.port || 'Porto base não informado'}</p></div><span className="vessel-client-tag">Cliente</span></div>
        <div className="vessel-client-port"><MapPin size={15}/><span>{vessel.port ? `Porto base: ${vessel.port}` : 'Porto base não informado'}</span></div>
        <div className="vessel-client-note"><Info size={15}/><p>Telefone e e-mail não estão cadastrados para este cliente.</p></div>
        <Link href="/ordens-servico" className="vessel-client-action"><FileText size={15}/>Ver ordens de serviço</Link>
      </aside>
    </div>
    <footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><Link href="/embarcacoes">Voltar à frota <ChevronRight size={13}/></Link></footer>
  </div></main><VesselDrawer open={drawerOpen} vessel={vessel} onClose={() => setDrawerOpen(false)} onSave={saveVessel}/>{orderDrawerOpen && <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeOrderDrawer() }}><aside className="workorder-drawer" role="dialog" aria-modal="true" aria-labelledby="vessel-new-order-title" aria-describedby="vessel-new-order-description"><header className="drawer-header"><div><div className="drawer-kicker">NOVA SOLICITAÇÃO / {vessel.id}</div><h2 id="vessel-new-order-title">Nova ordem de serviço</h2><p id="vessel-new-order-description">Crie uma ordem vinculada a {vessel.name} e ao cliente {vessel.owner}.</p></div><button type="button" className="drawer-close" aria-label="Fechar formulário" onClick={closeOrderDrawer}><X size={18}/></button></header><form className="new-order-form" onSubmit={createOrder}><div className="drawer-sections"><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><Ship size={17}/></span><span><strong>Detalhes do serviço</strong><small>Informações para organizar o atendimento</small></span></header><div className="form-card-fields"><label className="form-field"><span>Serviço <b>*</b></span><input ref={firstOrderFieldRef} required value={orderForm.service} onChange={event => setOrderForm({ ...orderForm, service: event.target.value })} placeholder="Ex.: Revisão do motor principal"/></label><div className="form-grid"><label className="form-field"><span>Categoria <b>*</b></span><select required value={orderForm.category} onChange={event => setOrderForm({ ...orderForm, category: event.target.value })}><option value="" disabled>Selecione</option>{['Motor', 'Hidráulica', 'Elétrica', 'Mecânica', 'Propulsão', 'Eletrônica'].map(category => <option key={category}>{category}</option>)}</select></label><label className="form-field"><span>Equipe responsável <b>*</b></span><select required value={orderForm.team} onChange={event => setOrderForm({ ...orderForm, team: event.target.value })}><option value="" disabled>Selecione</option>{['Equipe Alfa', 'Equipe Bravo', 'Equipe Charlie'].map(team => <option key={team}>{team}</option>)}</select></label></div><div className="form-grid"><label className="form-field"><span>Docagem <b>*</b></span><input type="date" required value={orderForm.docking} onChange={event => setOrderForm({ ...orderForm, docking: event.target.value })}/></label><label className="form-field"><span>Desdocagem prevista <b>*</b></span><input type="date" required min={orderForm.docking || undefined} value={orderForm.undocking} onChange={event => setOrderForm({ ...orderForm, undocking: event.target.value })}/></label></div><label className="form-field"><span>Prioridade</span><select value={orderForm.priority} onChange={event => setOrderForm({ ...orderForm, priority: event.target.value })}>{['Baixa', 'Normal', 'Alta', 'Urgente'].map(priority => <option key={priority}>{priority}</option>)}</select></label></div></section></div><footer className="drawer-footer"><span className="required-note"><b>*</b> Campos obrigatórios</span><div><button type="button" className="outline-btn" onClick={closeOrderDrawer}>Cancelar</button><button type="submit" className="primary-btn"><Plus size={15}/>Criar ordem de serviço</button></div></footer></form></aside></div>}</div>
}
