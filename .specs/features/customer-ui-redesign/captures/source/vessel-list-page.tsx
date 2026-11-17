'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Check, CircleHelp, Download, Gauge, Pencil, Plus, Search, Ship, Wrench, X } from 'lucide-react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { VesselDrawer, type Vessel, type VesselFormValues, type VesselStatus } from '@/components/vessels/vessel-drawer'
import { useVesselStore } from '@/components/vessels/vessel-store'

const statusStyles: Record<VesselStatus, string> = { Ativa: 'active', 'Em manutenção': 'maintenance', Inativa: 'inactive' }

export default function VesselsPage() {
  const { vessels, setVessels } = useVesselStore()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todas' | VesselStatus>('Todas')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null)
  const [notice, setNotice] = useState('')
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([])
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const filteredVessels = useMemo(() => vessels.filter(vessel => (statusFilter === 'Todas' || vessel.status === statusFilter) && `${vessel.name} ${vessel.owner} ${vessel.imo} ${vessel.type} ${vessel.port}`.toLowerCase().includes(query.toLowerCase())), [vessels, statusFilter, query])
  const allVisibleSelected = filteredVessels.length > 0 && filteredVessels.every(vessel => selectedVesselIds.includes(vessel.id))
  const partiallyVisibleSelected = filteredVessels.some(vessel => selectedVesselIds.includes(vessel.id)) && !allVisibleSelected
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partiallyVisibleSelected
  }, [partiallyVisibleSelected])
  const activeCount = vessels.filter(vessel => vessel.status === 'Ativa').length
  const maintenanceCount = vessels.filter(vessel => vessel.status === 'Em manutenção').length
  const inactiveCount = vessels.filter(vessel => vessel.status === 'Inativa').length
  const vesselStatusTabs: Array<'Todas' | VesselStatus> = ['Todas', 'Ativa', 'Em manutenção', 'Inativa']
  const vesselStatusCounts: Record<'Todas' | VesselStatus, number> = {
    Todas: vessels.length,
    Ativa: activeCount,
    'Em manutenção': maintenanceCount,
    Inativa: inactiveCount,
  }

  function openCreate(event: MouseEvent<HTMLButtonElement>) {
    openerRef.current = event.currentTarget
    setEditingVessel(null)
    setNotice('')
    setDrawerOpen(true)
  }

  function openEdit(vessel: Vessel, event: MouseEvent<HTMLButtonElement>) {
    openerRef.current = event.currentTarget
    setEditingVessel(vessel)
    setNotice('')
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    window.setTimeout(() => openerRef.current?.focus(), 0)
  }

  function toggleVesselSelection(vesselId: string) {
    setSelectedVesselIds(current => current.includes(vesselId) ? current.filter(id => id !== vesselId) : [...current, vesselId])
  }

  function toggleVisibleVessels() {
    const visibleIds = filteredVessels.map(vessel => vessel.id)
    setSelectedVesselIds(current => allVisibleSelected
      ? current.filter(id => !visibleIds.includes(id))
      : Array.from(new Set([...current, ...visibleIds])))
  }

  function exportVessels() {
    const selectedVessels = vessels.filter(vessel => selectedVesselIds.includes(vessel.id))
    const csvCell = (value: string) => {
      const safeValue = /^[\t\n\r ]*[=+\-@]/.test(value) ? `'${value}` : value
      return `"${safeValue.replaceAll('"', '""')}"`
    }
    const rows = [
      ['Embarcação', 'ID', 'Número IMO', 'Tipo', 'Comprimento (m)', 'Cliente', 'Porto base', 'Status'],
      ...selectedVessels.map(vessel => [vessel.name, vessel.id, vessel.imo, vessel.type, vessel.length.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), vessel.owner, vessel.port, vessel.status]),
    ]
    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'embarcacoes.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function saveVessel(values: VesselFormValues) {
    if (editingVessel) {
      setVessels(current => current.map(vessel => vessel.id === editingVessel.id ? { ...values, id: vessel.id } : vessel))
      setNotice(`${values.name} atualizada com sucesso.`)
    } else {
      const newVessel = { ...values, id: `EMB-${String(Date.now()).slice(-6)}` }
      setVessels(current => [newVessel, ...current])
      setNotice(`${values.name} adicionada à frota com sucesso.`)
      setQuery('')
      setStatusFilter('Todas')
    }
    setDrawerOpen(false)
  }

  return <div className="app-shell"><AppSidebar activePage="vessels"/><main className="main-area"><AppTopbar section="Embarcações"/><div className="page-content vessels-content"><div className="vessel-page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>OPERAÇÃO / FROTA</div><h1>Embarcações</h1><p className="subtitle">Gerencie os dados cadastrais e acompanhe a situação da sua frota.</p></div><button ref={openerRef} type="button" className="primary-btn" onClick={openCreate}><Plus size={17}/> Nova embarcação</button></div><section className="workorder-metrics vessel-metrics" aria-label="Resumo da frota"><article className="workorder-metric"><span className="metric-icon metric-total"><Ship size={17}/></span><div><span>Total na frota</span><strong>{vessels.length.toString().padStart(2, '0')}</strong></div><small>embarcações</small></article><article className="workorder-metric"><span className="metric-icon metric-progress"><Check size={17}/></span><div><span>Em operação</span><strong>{activeCount.toString().padStart(2, '0')}</strong></div><small className="metric-green"><i/> Ativas</small></article><article className="workorder-metric"><span className="metric-icon metric-pending"><Wrench size={17}/></span><div><span>Em manutenção</span><strong>{maintenanceCount.toString().padStart(2, '0')}</strong></div><small className="metric-amber">Atenção técnica</small></article><article className="workorder-metric"><span className="metric-icon metric-done"><Gauge size={17}/></span><div><span>Fora de operação</span><strong>{inactiveCount.toString().padStart(2, '0')}</strong></div><small>Inativas</small></article></section>{notice&&<div className="workorder-notice" role="status"><span><CircleHelp size={16}/>{notice}</span><button type="button" aria-label="Fechar aviso" onClick={() => setNotice('')}><X size={16}/></button></div>}<section className="panel vessel-list-panel"><div className="vessel-list-heading"><div><h2>Lista de embarcações</h2><p>Consulte, cadastre e atualize os dados da sua frota.</p></div><div className="vessel-list-actions"><button type="button" className="outline-btn export-btn" onClick={exportVessels} disabled={selectedVesselIds.length === 0} aria-label={selectedVesselIds.length === 1 ? 'Exportar 1 embarcação selecionada em CSV' : selectedVesselIds.length > 1 ? `Exportar ${selectedVesselIds.length} embarcações selecionadas em CSV` : 'Selecione embarcações para exportar'}><Download size={15}/> Exportar{selectedVesselIds.length > 0 ? ` (${selectedVesselIds.length})` : ''}</button></div></div><div className="workorders-filters vessel-filters"><div className="workorder-tabs" role="tablist" aria-label="Filtrar embarcações por status">{vesselStatusTabs.map(tab=><button key={tab} type="button" role="tab" aria-selected={statusFilter===tab} className={statusFilter===tab?'chosen':''} onClick={()=>setStatusFilter(tab)}>{tab}<span>{vesselStatusCounts[tab]}</span></button>)}</div><label className="workorder-search"><Search size={15}/><input aria-label="Buscar embarcação" placeholder="Buscar por nome, cliente ou IMO..." value={query} onChange={event => setQuery(event.target.value)}/>{query&&<button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={13}/></button>}</label></div><div className="vessels-table-wrap"><table className="vessels-table"><thead><tr><th className="order-select-cell"><input ref={selectAllRef} className="order-select-checkbox" type="checkbox" aria-label="Selecionar todas as embarcações visíveis" checked={allVisibleSelected} onChange={toggleVisibleVessels}/></th><th>EMBARCAÇÃO</th><th>NÚMERO IMO</th><th>TIPO</th><th>COMPRIMENTO</th><th>CLIENTE / PORTO BASE</th><th>STATUS</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filteredVessels.map(vessel=><tr key={vessel.id} className={selectedVesselIds.includes(vessel.id)?'is-selected':''}><td className="order-select-cell"><input className="order-select-checkbox" type="checkbox" aria-label={`Selecionar embarcação ${vessel.name}`} checked={selectedVesselIds.includes(vessel.id)} onChange={()=>toggleVesselSelection(vessel.id)}/></td><td><div className="boat-cell"><div className={`boat-avatar ${vessel.status === 'Ativa' ? 'teal' : vessel.status === 'Em manutenção' ? 'orange' : 'blue'}`}><Ship size={16}/></div><div><Link href={`/embarcacoes/${encodeURIComponent(vessel.id)}`} className="vessel-detail-link">{vessel.name}</Link><span>{vessel.id}</span></div></div></td><td>{vessel.imo || '—'}</td><td>{vessel.type}</td><td>{vessel.length.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} m</td><td><div className="vessel-owner-cell"><strong>{vessel.owner}</strong><span>{vessel.port || 'Porto não informado'}</span></div></td><td><span className={`vessel-status-badge ${statusStyles[vessel.status]}`}><i/>{vessel.status}</span></td><td><button type="button" className="vessel-edit-btn" aria-label={`Editar embarcação ${vessel.name}`} onClick={event => openEdit(vessel, event)}><Pencil size={14}/><span>Editar</span></button></td></tr>)}</tbody></table>{filteredVessels.length===0&&<div className="empty-state">Nenhuma embarcação corresponde à sua busca.</div>}</div><div className="vessels-list-footer"><span>Exibindo <strong>{filteredVessels.length}</strong> de <strong>{vessels.length}</strong> embarcações</span><span><Ship size={13}/> Frota atualizada</span></div></section><footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><span>Dados da frota <span className="live-dot"/></span></footer></div></main><VesselDrawer open={drawerOpen} vessel={editingVessel} onClose={closeDrawer} onSave={saveVessel}/></div>
}
