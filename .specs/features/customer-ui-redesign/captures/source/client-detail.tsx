'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Building2, Mail, MapPin, Phone, Ship } from 'lucide-react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { useClientStore, type Client } from '@/components/clients/client-store'
import { useVesselStore } from '@/components/vessels/vessel-store'

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

export function ClientDetail({ clientId }: { clientId: string }) {
  const { clients } = useClientStore()
  const { vessels } = useVesselStore()
  const resolvedClientId = decodeURIComponent(clientId)
  let client: Client | undefined = clients.find(item => item.id === resolvedClientId)

  if (!client && resolvedClientId.startsWith('owner:')) {
    const owner = vessels.find(item => item.owner.trim().toLocaleLowerCase('pt-BR') === resolvedClientId.slice('owner:'.length))
    if (owner) {
      const [city = '', state = ''] = owner.port.split(',').map(part => part.trim())
      client = { id: resolvedClientId, name: owner.owner, email: '', phone: '', street: '', city, state, logoUrl: '' }
    }
  }

  const clientVessels = client ? vessels.filter(vessel => vessel.owner.trim().toLocaleLowerCase('pt-BR') === client.name.trim().toLocaleLowerCase('pt-BR')) : []

  if (!client) {
    return <div className="app-shell"><AppSidebar activePage="clients"/><main className="main-area"><AppTopbar section="Clientes"/><div className="page-content client-detail-content"><section className="panel client-not-found"><span className="client-detail-icon"><Building2 size={20}/></span><h1>Cliente não encontrado</h1><p>Este cadastro não está disponível na lista de clientes.</p><Link href="/clientes" className="client-back-link"><ArrowLeft size={15}/>Voltar para clientes</Link></section></div></main></div>
  }

  return <div className="app-shell"><AppSidebar activePage="clients"/><main className="main-area"><AppTopbar section="Clientes"/><div className="page-content client-detail-content"><nav className="client-detail-breadcrumb" aria-label="Navegação estrutural"><Link href="/clientes"><ArrowLeft size={15}/>Clientes</Link><span>/</span><strong>{client.name}</strong></nav>
    <section className="panel client-profile-panel" aria-labelledby="client-detail-title"><div className="client-profile-heading">{client.logoUrl ? <img className="client-profile-logo" src={client.logoUrl} alt={`Logo de ${client.name}`} onError={event => { event.currentTarget.style.display = 'none' }}/> : <span className="client-profile-logo client-profile-initials" aria-hidden="true">{getInitials(client.name)}</span>}<div className="client-profile-copy"><span className="vessel-detail-kicker">{client.id.startsWith('owner:') ? 'PROPRIETÁRIO DA FROTA' : 'CADASTRO DE CLIENTE'}</span><h1 id="client-detail-title">{client.name}</h1><p>Proprietário de {clientVessels.length} {clientVessels.length === 1 ? 'embarcação' : 'embarcações'} na frota.</p></div><span className="client-profile-tag"><Building2 size={13}/>Proprietário</span></div></section>
    <div className="client-detail-grid"><div className="client-detail-main-column"><section className="panel client-info-panel" aria-labelledby="client-contact-title"><div className="client-detail-section-heading"><span className="client-detail-icon"><Phone size={16}/></span><div><h2 id="client-contact-title">Contato e endereço</h2><p>Dados cadastrados para este cliente.</p></div></div><dl className="client-info-grid"><div><dt><Mail size={14}/>E-mail</dt><dd>{client.email || 'Não informado'}</dd></div><div><dt><Phone size={14}/>Telefone</dt><dd>{client.phone || 'Não informado'}</dd></div><div className="client-info-wide"><dt><MapPin size={14}/>Endereço</dt><dd>{client.street || 'Rua não informada'}{client.city ? `, ${client.city}` : ''}{client.state ? `, ${client.state}` : ''}</dd></div></dl></section>
      <section className="panel client-vessels-panel" aria-labelledby="client-vessels-title"><div className="client-detail-section-heading"><span className="client-detail-icon client-detail-icon-teal"><Ship size={16}/></span><div><h2 id="client-vessels-title">Embarcações vinculadas</h2><p>Frota registrada em nome deste cliente.</p></div><span className="client-vessel-total">{clientVessels.length}</span></div>{clientVessels.length ? <div className="client-vessel-list">{clientVessels.map(vessel => <Link key={vessel.id} href={`/embarcacoes/${encodeURIComponent(vessel.id)}`} className="client-vessel-row"><span className="client-vessel-avatar"><Ship size={16}/></span><span className="client-vessel-copy"><strong>{vessel.name}</strong><small>{vessel.type} · {vessel.port || 'Porto não informado'}</small></span><span className={`client-vessel-status ${vessel.status === 'Ativa' ? 'is-active' : vessel.status === 'Em manutenção' ? 'is-maintenance' : 'is-inactive'}`}><i/>{vessel.status}</span><ArrowUpRight size={15} className="client-vessel-arrow"/></Link>)}</div> : <div className="client-vessels-empty"><Ship size={18}/><span>Nenhuma embarcação vinculada a este cliente.</span></div>}</section></div>
      <aside className="panel client-address-panel" aria-labelledby="client-address-title"><span className="client-detail-icon"><MapPin size={17}/></span><h2 id="client-address-title">Localização</h2><p>{client.city || 'Cidade não informada'}{client.state ? `, ${client.state}` : ''}</p><div className="client-address-line"><MapPin size={14}/><span>{client.street || 'Endereço não informado'}</span></div><div className="client-address-line"><Building2 size={14}/><span>{client.city && client.state ? `${client.city} — ${client.state}` : 'Cidade e estado não informados'}</span></div></aside></div>
    <footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><Link href="/clientes">Voltar à lista <ArrowLeft size={13}/></Link></footer></div></main></div>
}
