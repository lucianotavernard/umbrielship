'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { Activity, Anchor, Check, Download, Mail, Phone, Plus, Search, Users, Wrench, X } from 'lucide-react'
import { useTeamStore, type Technician } from '@/components/teams/team-store'
import styles from './team-management.module.css'

const EMPTY_FORM = { name: '', role: '', team: 'Equipe Alfa', email: '', phone: '' }

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('pt-BR')
}

export function TeamManagement() {
  const { technicians, setTechnicians } = useTeamStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todas as equipes')
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [notice, setNotice] = useState('')

  const visibleTechnicians = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR')
    return technicians.filter(person => (filter === 'Todas as equipes' || person.team === filter) && (!specialtyFilter || person.role === specialtyFilter) && `${person.name} ${person.role} ${person.team} ${person.email}`.toLocaleLowerCase('pt-BR').includes(term))
  }, [technicians, query, filter, specialtyFilter])
  const specialties = useMemo(() => {
    const counts = new Map<string, number>()
    technicians.forEach(person => counts.set(person.role, (counts.get(person.role) ?? 0) + 1))
    return [...counts.entries()].sort(([first], [second]) => first.localeCompare(second, 'pt-BR'))
  }, [technicians])
  const teamCount = new Set(technicians.map(person => person.team)).size
  const availableCount = technicians.filter(person => person.status === 'Disponível').length
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([])
  const selectAllRef = useRef<HTMLInputElement>(null)
  const allVisibleSelected = visibleTechnicians.length > 0 && visibleTechnicians.every(person => selectedTechnicianIds.includes(person.id))
  const partiallyVisibleSelected = visibleTechnicians.some(person => selectedTechnicianIds.includes(person.id)) && !allVisibleSelected

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partiallyVisibleSelected
  }, [partiallyVisibleSelected])

  function openDrawer() {
    setForm(EMPTY_FORM)
    setDrawerOpen(true)
  }

  function saveTechnician(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Technician = { ...form, id: `tech-${Date.now()}`, name: form.name.trim(), role: form.role.trim(), email: form.email.trim(), phone: form.phone.trim(), status: 'Disponível' }
    setTechnicians(current => [next, ...current])
    setFilter('Todas as equipes')
    setSpecialtyFilter(null)
    setQuery('')
    setDrawerOpen(false)
    setNotice(`${next.name} foi adicionado à equipe técnica.`)
  }

  function toggleTechnicianSelection(technicianId: string) {
    setSelectedTechnicianIds(current => current.includes(technicianId) ? current.filter(id => id !== technicianId) : [...current, technicianId])
  }

  function toggleVisibleTechnicians() {
    const visibleIds = visibleTechnicians.map(person => person.id)
    setSelectedTechnicianIds(current => allVisibleSelected
      ? current.filter(id => !visibleIds.includes(id))
      : Array.from(new Set([...current, ...visibleIds])))
  }

  function exportTechnicians() {
    const selectedTechnicians = technicians.filter(person => selectedTechnicianIds.includes(person.id))
    const csvCell = (value: string) => {
      const safeValue = /^[\t\n\r ]*[=+\-@]/.test(value) ? `'${value}` : value
      return `"${safeValue.replaceAll('"', '""')}"`
    }
    const rows = [
      ['Nome', 'Especialidade', 'Equipe', 'E-mail', 'Telefone', 'Status'],
      ...selectedTechnicians.map(person => [person.name, person.role, person.team, person.email, person.phone, person.status]),
    ]
    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'equipe-tecnica.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <AppSidebar activePage="team" />
    <main className="main-area">
      <AppTopbar section="Equipe técnica" />
      <div className={`page-content ${styles.page}`}>
        <header className={styles.heading}>
          <div><div className="eyebrow"><span className="eyebrow-line" />OPERAÇÃO / PESSOAS</div><h1>Equipe técnica</h1><p className="subtitle">Conheça os profissionais e organize os times da oficina.</p></div>
          <button type="button" className="primary-btn" onClick={openDrawer}><Plus size={16} /> Cadastrar profissional</button>
        </header>

        {notice && <div className={styles.notice} role="status"><Check size={15} />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={14} /></button></div>}

        <section className={styles.metrics} aria-label="Resumo da equipe">
          <article className={styles.metric}><span className={styles.metricIcon}><Users size={17} /></span><div><small>Profissionais cadastrados</small><strong>{String(technicians.length).padStart(2, '0')}</strong></div><span className={styles.metricNote}>na equipe</span></article>
          <article className={styles.metric}><span className={`${styles.metricIcon} ${styles.teal}`}><Anchor size={17} /></span><div><small>Times em operação</small><strong>{String(teamCount).padStart(2, '0')}</strong></div><span className={styles.metricNote}>equipes</span></article>
          <article className={styles.metric}><span className={`${styles.metricIcon} ${styles.green}`}><Activity size={17} /></span><div><small>Disponíveis agora</small><strong>{String(availableCount).padStart(2, '0')}</strong></div><span className={styles.live}><i /> disponíveis</span></article>
        </section>

        <section className={styles.listPanel} aria-labelledby="technician-list-title">
          <div className={styles.listHeader}><div><h2 id="technician-list-title">Profissionais</h2><p>Cadastro e alocação dos técnicos da oficina.</p></div><div className={styles.listActions}><button type="button" className="outline-btn export-btn" onClick={exportTechnicians} disabled={selectedTechnicianIds.length === 0} aria-label={selectedTechnicianIds.length === 1 ? 'Exportar 1 profissional selecionado em CSV' : selectedTechnicianIds.length > 1 ? `Exportar ${selectedTechnicianIds.length} profissionais selecionados em CSV` : 'Selecione profissionais para exportar'}><Download size={15} /> Exportar{selectedTechnicianIds.length > 0 ? ` (${selectedTechnicianIds.length})` : ''}</button><div className={styles.filters}>
            <label className={styles.search}><Search size={15} /><span className="sr-only">Buscar profissional</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar profissional..." /></label>
            <label className="sr-only" htmlFor="team-filter">Filtrar por equipe</label><select id="team-filter" value={filter} onChange={event => setFilter(event.target.value)}><option>Todas as equipes</option>{['Equipe Alfa', 'Equipe Bravo', 'Equipe Charlie'].map(team => <option key={team}>{team}</option>)}</select>
          </div></div></div>
          <div className={styles.specialtyFilters} role="group" aria-label="Filtrar por especialidade">
            <button type="button" className={`${styles.specialtyFilter} ${specialtyFilter === null ? styles.specialtyFilterActive : ''}`} aria-pressed={specialtyFilter === null} onClick={() => setSpecialtyFilter(null)}><span>Todas</span><span className={styles.specialtyCount}>{technicians.length}</span></button>
            {specialties.map(([specialty, count]) => <button key={specialty} type="button" className={`${styles.specialtyFilter} ${specialtyFilter === specialty ? styles.specialtyFilterActive : ''}`} aria-pressed={specialtyFilter === specialty} onClick={() => setSpecialtyFilter(specialty)}><span>{specialty}</span><span className={styles.specialtyCount}>{count}</span></button>)}
          </div>
          <div className={styles.tableWrap}><table><thead><tr><th className={styles.selectionCell}><input ref={selectAllRef} className={styles.selectionCheckbox} type="checkbox" aria-label="Selecionar todos os profissionais visíveis" checked={allVisibleSelected} onChange={toggleVisibleTechnicians} /></th><th>PROFISSIONAL</th><th>ESPECIALIDADE</th><th>EQUIPE</th><th>CONTATO</th><th>STATUS</th></tr></thead><tbody>
            {visibleTechnicians.map((person, index) => <tr key={person.id} className={selectedTechnicianIds.includes(person.id) ? styles.selectedRow : ''}><td className={styles.selectionCell}><input className={styles.selectionCheckbox} type="checkbox" aria-label={`Selecionar profissional ${person.name}`} checked={selectedTechnicianIds.includes(person.id)} onChange={() => toggleTechnicianSelection(person.id)} /></td><td><div className={styles.person}><span className={`${styles.avatar} ${styles[`tone${index % 3}`]}`} aria-hidden="true">{initials(person.name)}</span><Link className={styles.personLink} href={`/equipe-tecnica/${encodeURIComponent(person.id)}`}>{person.name}</Link></div></td><td><span className={styles.role}><Wrench size={13} />{person.role}</span></td><td><span className={styles.team}><Users size={13} />{person.team}</span></td><td><div className={styles.contact}><span><Mail size={13} />{person.email}</span><span><Phone size={13} />{person.phone}</span></div></td><td><span className={`${styles.status} ${styles[person.status === 'Disponível' ? 'available' : person.status === 'Em serviço' ? 'working' : 'off']}`}><i />{person.status}</span></td></tr>)}
          </tbody></table>{visibleTechnicians.length === 0 && <div className={styles.empty}>{technicians.length ? 'Nenhum profissional encontrado com esses filtros.' : 'Ainda não há profissionais cadastrados.'}</div>}</div>
          <footer className={styles.listFooter}><span>Exibindo {visibleTechnicians.length} de {technicians.length} profissionais</span><span>Equipe técnica MARÉOS</span></footer>
        </section>
        <footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><span>Gestão da equipe técnica</span></footer>
      </div>
    </main>

    {drawerOpen && <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setDrawerOpen(false) }}><aside className={`workorder-drawer ${styles.drawer}`} role="dialog" aria-modal="true" aria-labelledby="team-drawer-title" aria-describedby="team-drawer-description">
      <header className="drawer-header"><div><div className="drawer-kicker">OPERAÇÃO / EQUIPE TÉCNICA</div><h2 id="team-drawer-title">Novo profissional</h2><p id="team-drawer-description">Adicione um técnico e vincule-o a uma equipe.</p></div><button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Fechar cadastro"><X size={18} /></button></header>
      <form className={styles.form} onSubmit={saveTechnician}><label>Nome completo<input required maxLength={120} autoFocus value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Ana Souza" /></label><label>Especialidade<input required maxLength={100} value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))} placeholder="Ex.: Mecânica naval" /></label><label>Equipe<select value={form.team} onChange={event => setForm(current => ({ ...current, team: event.target.value }))}>{['Equipe Alfa', 'Equipe Bravo', 'Equipe Charlie'].map(team => <option key={team}>{team}</option>)}</select></label><div className={styles.formRow}><label>E-mail<input required type="email" maxLength={254} value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} placeholder="nome@mareos.com.br" /></label><label>Telefone<input required type="tel" maxLength={30} value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} placeholder="(00) 00000-0000" /></label></div><div className={styles.actions}><button type="button" className={styles.cancel} onClick={() => setDrawerOpen(false)}>Cancelar</button><button type="submit" className="primary-btn"><Plus size={15} /> Cadastrar profissional</button></div></form>
    </aside></div>}
  </div>
}
