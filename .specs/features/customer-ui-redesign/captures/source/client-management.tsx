'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Building2, CircleHelp, Mail, MapPin, Pencil, Phone, Plus, Search, Ship, Users, X } from 'lucide-react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { useClientStore, type Client } from '@/components/clients/client-store'
import { useVesselStore } from '@/components/vessels/vessel-store'

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

export function ClientManagement() {
  const { clients: clientRecords, setClients } = useClientStore()
  const { vessels, setVessels } = useVesselStore()
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState<Omit<Client, 'id'>>({ name: '', email: '', phone: '', street: '', city: '', state: '', logoUrl: '' })
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const clients = useMemo(() => {
    const knownNames = new Set(clientRecords.map(client => client.name.trim().toLocaleLowerCase('pt-BR')))
    const missingOwners = new Map<string, Client>()
    vessels.forEach(vessel => {
      const key = vessel.owner.trim().toLocaleLowerCase('pt-BR')
      if (!key || knownNames.has(key) || missingOwners.has(key)) return
      const [city = '', state = ''] = vessel.port.split(',').map(part => part.trim())
      missingOwners.set(key, { id: `owner:${key}`, name: vessel.owner, email: '', phone: '', street: '', city, state, logoUrl: '' })
    })
    return [...clientRecords, ...missingOwners.values()].map(client => ({
      ...client,
      vesselCount: vessels.filter(vessel => vessel.owner.trim().toLocaleLowerCase('pt-BR') === client.name.trim().toLocaleLowerCase('pt-BR')).length,
    })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [clientRecords, vessels])

  const filteredClients = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('pt-BR')
    if (!normalized) return clients
    return clients.filter(client => `${client.name} ${client.email} ${client.phone} ${client.city} ${client.state}`.toLocaleLowerCase('pt-BR').includes(normalized))
  }, [clients, search])
  const vesselCount = clients.reduce((total, client) => total + client.vesselCount, 0)

  function openCreate() {
    setEditingClient(null)
    setForm({ name: '', email: '', phone: '', street: '', city: '', state: '', logoUrl: '' })
    setFormError('')
    setDrawerOpen(true)
  }

  function openEdit(client: Client) {
    setEditingClient(client)
    setForm({ name: client.name, email: client.email, phone: client.phone, street: client.street, city: client.city, state: client.state, logoUrl: client.logoUrl })
    setFormError('')
    setDrawerOpen(true)
  }

  function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = form.name.trim()
    const duplicate = clients.some(client => client.id !== editingClient?.id && client.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))
    if (duplicate) {
      setFormError('Já existe um cliente cadastrado com esse nome.')
      return
    }

    const values = { ...form, name, email: form.email.trim(), phone: form.phone.trim(), street: form.street.trim(), city: form.city.trim(), state: form.state.trim().toUpperCase(), logoUrl: form.logoUrl.trim() }
    if (editingClient) {
      const stableId = editingClient.id
      const nextId = stableId.startsWith('owner:') ? `owner:${name.toLocaleLowerCase('pt-BR')}` : stableId
      if (stableId.startsWith('owner:') && editingClient.name !== name) {
        const oldName = editingClient.name.toLocaleLowerCase('pt-BR')
        setVessels(current => current.map(vessel => vessel.owner.trim().toLocaleLowerCase('pt-BR') === oldName ? { ...vessel, owner: name } : vessel))
      }
      setClients(current => current.some(client => client.id === stableId) ? current.map(client => client.id === stableId ? { ...values, id: nextId } : client) : [...current, { ...values, id: nextId }])
      setNotice(`${name} atualizado com sucesso.`)
    } else {
      setClients(current => [{ ...values, id: `client-${Date.now()}` }, ...current])
      setNotice(`${name} cadastrado com sucesso.`)
      setSearch('')
    }
    setDrawerOpen(false)
    setFormError('')
  }

  return <div className="app-shell"><AppSidebar activePage="clients"/><main className="main-area"><AppTopbar section="Clientes"/><div className="page-content clients-content"><div className="vessel-page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>OPERAÇÃO / RELACIONAMENTO</div><h1>Clientes</h1><p className="subtitle">Gerencie os proprietários das embarcações e seus dados de contato.</p></div><button type="button" className="primary-btn" onClick={openCreate}><Plus size={17}/> Novo cliente</button></div>
      <section className="workorder-metrics client-metrics" aria-label="Resumo de clientes"><article className="workorder-metric"><span className="metric-icon metric-total"><Users size={17}/></span><div><span>Clientes cadastrados</span><strong>{String(clients.length).padStart(2, '0')}</strong></div><small>proprietários</small></article><article className="workorder-metric"><span className="metric-icon metric-progress"><Ship size={17}/></span><div><span>Embarcações vinculadas</span><strong>{String(vesselCount).padStart(2, '0')}</strong></div><small>na frota</small></article><article className="workorder-metric"><span className="metric-icon metric-pending"><Mail size={17}/></span><div><span>Com e-mail cadastrado</span><strong>{String(clients.filter(client => client.email).length).padStart(2, '0')}</strong></div><small>contatos</small></article><article className="workorder-metric"><span className="metric-icon metric-done"><Phone size={17}/></span><div><span>Com telefone cadastrado</span><strong>{String(clients.filter(client => client.phone).length).padStart(2, '0')}</strong></div><small>contatos</small></article></section>
      {notice && <div className="workorder-notice" role="status"><span><CircleHelp size={16}/>{notice}</span><button type="button" aria-label="Fechar aviso" onClick={() => setNotice('')}><X size={16}/></button></div>}
      <section className="panel client-list-panel" aria-labelledby="client-list-title"><div className="client-list-heading"><div><h2 id="client-list-title">Lista de clientes</h2><p>Os proprietários são identificados a partir das embarcações cadastradas.</p></div><label className="client-search"><Search size={15}/><span className="sr-only">Buscar clientes</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, contato ou cidade..." /></label></div>
        <div className="client-table-wrap"><table className="client-table"><thead><tr><th>CLIENTE</th><th>CONTATO</th><th>LOCALIZAÇÃO</th><th>EMBARCAÇÕES</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filteredClients.map(client => <tr key={client.id}><td><div className="client-identity">{client.logoUrl ? <img className="client-logo" src={client.logoUrl} alt={`Logo de ${client.name}`} onError={event => { event.currentTarget.style.display = 'none' }} /> : <span className="client-logo client-initials" aria-hidden="true">{getInitials(client.name)}</span>}<span><Link className="client-name-link" href={`/clientes/${encodeURIComponent(client.id)}`}>{client.name}</Link><small>{client.street || 'Endereço não informado'}</small></span></div></td><td><div className="client-contact"><span><Mail size={13}/>{client.email || 'E-mail não informado'}</span><span><Phone size={13}/>{client.phone || 'Telefone não informado'}</span></div></td><td><span className="client-location"><MapPin size={13}/>{client.city ? `${client.city}${client.state ? `, ${client.state}` : ''}` : 'Localização não informada'}</span></td><td><span className="client-vessel-count"><Ship size={14}/>{client.vesselCount} {client.vesselCount === 1 ? 'embarcação' : 'embarcações'}</span></td><td><div className="client-row-actions"><Link href={`/clientes/${encodeURIComponent(client.id)}`} className="client-edit-btn" aria-label={`Ver detalhes de ${client.name}`}><ArrowUpRight size={14}/></Link><button type="button" className="client-edit-btn" onClick={() => openEdit(client)} aria-label={`Editar ${client.name}`}><Pencil size={14}/></button></div></td></tr>)}</tbody></table>{filteredClients.length === 0 && <div className="empty-state">{clients.length ? 'Nenhum cliente encontrado para essa busca.' : 'Ainda não há clientes cadastrados.'}</div>}</div>
        <footer className="client-list-footer"><span>Exibindo {filteredClients.length} de {clients.length} clientes</span><span>Cadastro vinculado à frota</span></footer></section><footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><span>Gestão de clientes</span></footer></div></main>
      {drawerOpen && <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setDrawerOpen(false) }}><aside className="workorder-drawer client-drawer" role="dialog" aria-modal="true" aria-labelledby="client-drawer-title" aria-describedby="client-drawer-description"><header className="drawer-header"><div><div className="drawer-kicker">RELACIONAMENTO / CLIENTES</div><h2 id="client-drawer-title">{editingClient ? 'Editar cliente' : 'Novo cliente'}</h2><p id="client-drawer-description">Cadastre os dados de contato do proprietário da embarcação.</p></div><button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Fechar cadastro"><X size={18}/></button></header><form onSubmit={saveClient}><div className="drawer-sections"><section className="drawer-section"><div className="drawer-section-heading"><span className="drawer-section-icon"><Building2 size={15}/></span><div><strong>Dados do cliente</strong><small>Identificação e formas de contato</small></div></div><div className="client-fields-grid"><label className="form-field form-field-wide"><span>Nome do cliente <i>*</i></span><input required maxLength={120} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Náutica Costa Sul" /></label><label className="form-field"><span>E-mail <i>*</i></span><input required type="email" maxLength={254} value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} placeholder="contato@empresa.com.br" /></label><label className="form-field"><span>Telefone para contato <i>*</i></span><input required type="tel" maxLength={30} value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} placeholder="(00) 00000-0000" /></label><label className="form-field form-field-wide"><span>Logo (URL da imagem)</span><input type="url" maxLength={2048} value={form.logoUrl} onChange={event => setForm(current => ({ ...current, logoUrl: event.target.value }))} placeholder="https://exemplo.com/logo.png" /></label></div></section><section className="drawer-section"><div className="drawer-section-heading"><span className="drawer-section-icon"><MapPin size={15}/></span><div><strong>Endereço</strong><small>Localização do cliente</small></div></div><div className="client-fields-grid"><label className="form-field form-field-wide"><span>Rua e número <i>*</i></span><input required maxLength={180} value={form.street} onChange={event => setForm(current => ({ ...current, street: event.target.value }))} placeholder="Rua, número e complemento" /></label><label className="form-field"><span>Cidade <i>*</i></span><input required maxLength={100} value={form.city} onChange={event => setForm(current => ({ ...current, city: event.target.value }))} placeholder="Cidade" /></label><label className="form-field"><span>Estado (UF) <i>*</i></span><input required maxLength={2} minLength={2} value={form.state} onChange={event => setForm(current => ({ ...current, state: event.target.value.replace(/[^a-z]/gi, '').slice(0, 2) }))} placeholder="SP" /></label></div></section>{formError && <p className="client-form-error" role="alert">{formError}</p>}</div><footer className="drawer-footer"><span>Campos com <i>*</i> são obrigatórios</span><div className="drawer-actions"><button type="button" className="outline-btn" onClick={() => setDrawerOpen(false)}>Cancelar</button><button type="submit" className="primary-btn"><Plus size={15}/>{editingClient ? 'Salvar alterações' : 'Cadastrar cliente'}</button></div></footer></form></aside></div>}
    </div>
}
