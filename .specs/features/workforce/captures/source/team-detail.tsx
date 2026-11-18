'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Mail, Phone, ShieldCheck, Users, Wrench } from 'lucide-react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { useTeamStore } from '@/components/teams/team-store'
import styles from './team-detail.module.css'

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('pt-BR')
}

export function TeamDetail({ technicianId }: { technicianId: string }) {
  const { technicians } = useTeamStore()
  const technician = technicians.find(person => person.id === decodeURIComponent(technicianId))

  if (!technician) {
    return <div className="app-shell"><AppSidebar activePage="team" /><main className="main-area"><AppTopbar section="Equipe técnica" /><div className={`page-content ${styles.page}`}><section className={styles.notFound}><span className={styles.notFoundIcon}><Users size={20} /></span><h1>Profissional não encontrado</h1><p>Este cadastro não está disponível na equipe técnica.</p><Link href="/equipe-tecnica" className={styles.backLink}><ArrowLeft size={15} /> Voltar para a equipe</Link></section></div></main></div>
  }

  const statusClass = technician.status === 'Disponível' ? styles.available : technician.status === 'Em serviço' ? styles.working : styles.off

  return <div className="app-shell">
    <AppSidebar activePage="team" />
    <main className="main-area">
      <AppTopbar section="Equipe técnica" />
      <div className={`page-content ${styles.page}`}>
        <nav className={styles.breadcrumb} aria-label="Navegação estrutural"><Link href="/equipe-tecnica"><ArrowLeft size={15} /> Equipe técnica</Link><span>/</span><strong>{technician.name}</strong></nav>
        <section className={styles.profile} aria-labelledby="technician-title">
          <span className={styles.avatar} aria-hidden="true">{initials(technician.name)}</span>
          <div className={styles.profileCopy}><span className={styles.kicker}>PERFIL PROFISSIONAL</span><h1 id="technician-title">{technician.name}</h1><p>{technician.role}</p></div>
          <span className={`${styles.status} ${statusClass}`}><i />{technician.status}</span>
        </section>

        <section className={styles.metrics} aria-label="Resumo profissional">
          <article className={styles.metric}><span className={styles.metricIcon}><Wrench size={17} /></span><div><small>Especialidade</small><strong>{technician.role}</strong></div></article>
          <article className={styles.metric}><span className={`${styles.metricIcon} ${styles.teal}`}><Users size={17} /></span><div><small>Equipe vinculada</small><strong>{technician.team}</strong></div></article>
          <article className={styles.metric}><span className={`${styles.metricIcon} ${styles.green}`}><ShieldCheck size={17} /></span><div><small>Situação atual</small><strong>{technician.status}</strong></div></article>
        </section>

        <div className={styles.detailsGrid}>
          <section className={styles.panel} aria-labelledby="contact-title"><header className={styles.panelHeading}><span className={styles.sectionIcon}><BriefcaseBusiness size={16} /></span><div><h2 id="contact-title">Contato profissional</h2><p>Informações para comunicação direta.</p></div></header><dl className={styles.contactList}><div><dt><Mail size={14} /> E-mail</dt><dd><a href={`mailto:${technician.email}`}>{technician.email}<ArrowUpRight size={13} /></a></dd></div><div><dt><Phone size={14} /> Telefone</dt><dd><a href={`tel:${technician.phone.replace(/[^\d+]/g, '')}`}>{technician.phone}<ArrowUpRight size={13} /></a></dd></div></dl></section>
          <section className={styles.panel} aria-labelledby="allocation-title"><header className={styles.panelHeading}><span className={`${styles.sectionIcon} ${styles.sectionIconTeal}`}><Users size={16} /></span><div><h2 id="allocation-title">Alocação na oficina</h2><p>Vínculo atual do profissional.</p></div></header><div className={styles.allocation}><span className={styles.teamMark}><Users size={18} /></span><div><strong>{technician.team}</strong><span>Equipe técnica</span></div><span className={`${styles.status} ${statusClass}`}><i />{technician.status}</span></div><Link className={styles.backLink} href="/equipe-tecnica"><ArrowLeft size={14} /> Voltar à lista da equipe</Link></section>
        </div>
        <footer className="page-footer"><span>MARÉOS <span>·</span> Operação com rumo certo.</span><Link href="/equipe-tecnica">Equipe técnica <ArrowLeft size={13} /></Link></footer>
      </div>
    </main>
  </div>
}
