'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AppSidebar, AppTopbar } from '@/components/app-sidebar'
import { Anchor, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Compass, Plus, Search, Ship, SlidersHorizontal, Sparkles, Waves, Wrench, X } from 'lucide-react'
import styles from './agenda.module.css'

type ScheduleEvent = {
  id: string
  vessel: string
  service: string
  team: string
  time: string
  date: string
  kind: 'Motor' | 'Hidráulica' | 'Elétrica' | 'Docagem' | 'Inspeção' | 'Entrega'
  status: 'Confirmado' | 'Em andamento' | 'Aguardando peça'
}

const DEMO_DATE = new Date(2025, 5, 18)
const INITIAL_EVENTS: ScheduleEvent[] = [
  { id: 'OS-2481', vessel: 'Santa Maria', service: 'Revisão do motor principal', team: 'Equipe Alfa', time: '08:30', date: '2025-06-16', kind: 'Motor', status: 'Em andamento' },
  { id: 'OS-2479', vessel: 'Maré Alta', service: 'Inspeção elétrica e sonar', team: 'Equipe Alfa', time: '11:00', date: '2025-06-16', kind: 'Inspeção', status: 'Confirmado' },
  { id: 'OS-2480', vessel: 'Lula Branca', service: 'Troca do sistema hidráulico', team: 'Equipe Bravo', time: '09:00', date: '2025-06-17', kind: 'Hidráulica', status: 'Aguardando peça' },
  { id: 'OS-2474', vessel: 'Rainha do Mar', service: 'Calibração do radar', team: 'Equipe Bravo', time: '14:00', date: '2025-06-17', kind: 'Elétrica', status: 'Confirmado' },
  { id: 'OS-2481', vessel: 'Santa Maria', service: 'Teste de mar pós-revisão', team: 'Equipe Alfa', time: '08:30', date: '2025-06-18', kind: 'Inspeção', status: 'Confirmado' },
  { id: 'OS-2480', vessel: 'Lula Branca', service: 'Instalação de bomba hidráulica', team: 'Equipe Bravo', time: '10:00', date: '2025-06-18', kind: 'Hidráulica', status: 'Aguardando peça' },
  { id: 'OS-2478', vessel: 'Estrela do Sul', service: 'Manutenção do guincho de rede', team: 'Equipe Charlie', time: '13:30', date: '2025-06-18', kind: 'Motor', status: 'Em andamento' },
  { id: 'OS-2479', vessel: 'Maré Alta', service: 'Ajuste do sistema de sonar', team: 'Equipe Alfa', time: '15:30', date: '2025-06-18', kind: 'Elétrica', status: 'Confirmado' },
  { id: 'OS-2476', vessel: 'Vento Leste', service: 'Revisão preventiva do motor', team: 'Equipe Alfa', time: '08:30', date: '2025-06-19', kind: 'Motor', status: 'Confirmado' },
  { id: 'OS-2477', vessel: 'São Pedro II', service: 'Reparo na bomba de porão', team: 'Equipe Bravo', time: '11:30', date: '2025-06-19', kind: 'Hidráulica', status: 'Confirmado' },
  { id: 'OS-2475', vessel: 'Pescador I', service: 'Substituição de hélice', team: 'Equipe Charlie', time: '09:00', date: '2025-06-20', kind: 'Docagem', status: 'Confirmado' },
  { id: 'OS-2474', vessel: 'Rainha do Mar', service: 'Teste de navegação e radar', team: 'Equipe Bravo', time: '14:00', date: '2025-06-20', kind: 'Inspeção', status: 'Confirmado' },
  { id: 'OS-2478', vessel: 'Estrela do Sul', service: 'Retirada do berço de manutenção', team: 'Equipe Charlie', time: '08:00', date: '2025-06-21', kind: 'Entrega', status: 'Confirmado' },
]

const TIMES = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const CATEGORY_LABELS = ['Todas', 'Motor', 'Hidráulica', 'Elétrica', 'Docagem', 'Inspeção', 'Entrega'] as const
const VESSELS = ['Santa Maria', 'Lula Branca', 'Maré Alta', 'Estrela do Sul', 'São Pedro II', 'Vento Leste', 'Pescador I', 'Rainha do Mar']
const TEAMS = ['Equipe Alfa', 'Equipe Bravo', 'Equipe Charlie']

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function weekDaysFor(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return day
  })
}

function shortDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date).replace('.', '')
}

function longDate(date: Date) {
  const formatted = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  return formatted.charAt(0).toLocaleUpperCase('pt-BR') + formatted.slice(1)
}

function eventSlot(time: string) {
  return Math.min(5, Math.max(0, Math.floor((Number(time.slice(0, 2)) - 8) / 2)))
}

function kindClass(kind: ScheduleEvent['kind']) {
  return kind.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function AgendaPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [focusDate, setFocusDate] = useState(DEMO_DATE)
  const [view, setView] = useState<'Semana' | 'Dia'>('Semana')
  const [category, setCategory] = useState<(typeof CATEGORY_LABELS)[number]>('Todas')
  const [teamFilter, setTeamFilter] = useState('Todas as equipes')
  const [query, setQuery] = useState('')
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [notice, setNotice] = useState('')
  const modalOpenerRef = useRef<HTMLElement | null>(null)
  const modalOpen = newEventOpen || selectedEvent !== null
  const [form, setForm] = useState({ vessel: '', service: '', team: TEAMS[0], date: dateKey(DEMO_DATE), time: '08:30', kind: 'Motor' as ScheduleEvent['kind'] })
  const days = useMemo(() => weekDaysFor(focusDate), [focusDate])
  const shownDays = view === 'Dia' ? [focusDate] : days
  const visibleEvents = useMemo(() => events.filter(event => (category === 'Todas' || event.kind === category) && (teamFilter === 'Todas as equipes' || event.team === teamFilter) && `${event.id} ${event.vessel} ${event.service} ${event.team}`.toLowerCase().includes(query.toLowerCase())), [events, category, teamFilter, query])
  const dayEvents = visibleEvents.filter(event => event.date === dateKey(focusDate)).sort((a, b) => a.time.localeCompare(b.time))
  const weekLabel = days[0].getMonth() === days[6].getMonth()
    ? `${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(days[0])} ${days[0].getFullYear()}`
    : `${shortDate(days[0])} — ${shortDate(days[6])}, ${days[6].getFullYear()}`
  const countThisWeek = visibleEvents.filter(event => days.some(day => dateKey(day) === event.date)).length
  const dockingsThisWeek = visibleEvents.filter(event => days.some(day => dateKey(day) === event.date) && event.kind === 'Docagem').length
  const assignedTeams = new Set(visibleEvents.filter(event => days.some(day => dateKey(day) === event.date)).map(event => event.team)).size

  useEffect(() => {
    if (!modalOpen) return
    const dialog = document.querySelector<HTMLElement>('[data-agenda-dialog]')
    const getFocusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ?? [])
    const previousOverflow = document.body.style.overflow
    getFocusable()[0]?.focus()
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNewEventOpen(false)
        setSelectedEvent(null)
        window.setTimeout(() => modalOpenerRef.current?.focus(), 0)
      }
      if (event.key === 'Tab') {
        const focusable = getFocusable()
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
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [modalOpen])

  function closeDialog() {
    setNewEventOpen(false)
    setSelectedEvent(null)
    window.setTimeout(() => modalOpenerRef.current?.focus(), 0)
  }

  function moveWeek(direction: number) {
    setFocusDate(current => {
      const next = new Date(current)
      next.setDate(next.getDate() + direction * (view === 'Dia' ? 1 : 7))
      return next
    })
  }

  function openNewEvent(date = focusDate, time = '08:30') {
    modalOpenerRef.current = document.activeElement as HTMLElement
    setForm(current => ({ ...current, date: dateKey(date), time }))
    setNotice('')
    setNewEventOpen(true)
  }

  function openEventDetails(item: ScheduleEvent) {
    modalOpenerRef.current = document.activeElement as HTMLElement
    setSelectedEvent(item)
  }

  function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: ScheduleEvent = {
      id: `OS-${String(2482 + events.length - INITIAL_EVENTS.length).padStart(4, '0')}`,
      vessel: form.vessel,
      service: form.service,
      team: form.team,
      date: form.date,
      time: form.time,
      kind: form.kind,
      status: 'Confirmado',
    }
    setEvents(current => [...current, next])
    setFocusDate(dateFromKey(form.date))
    closeDialog()
    setNotice(`${next.service} foi adicionado à agenda.`)
    setForm(current => ({ ...current, vessel: '', service: '', date: dateKey(focusDate), time: '08:30' }))
  }

  return (
    <div className="app-shell">
      <AppSidebar activePage="agenda" />
      <main className="main-area">
        <AppTopbar section="Agenda" />
        <div className={`page-content ${styles.page}`}>
          <div className={styles.heading}>
            <div>
              <div className={styles.eyebrow}><span />OPERAÇÃO / PLANEJAMENTO</div>
              <h1>Agenda</h1>
              <p className={styles.subtitle}>Serviços, docagens e equipes em um só rumo.</p>
            </div>
            <button className="primary-btn" onClick={() => openNewEvent()}><Plus size={17} /> Novo compromisso</button>
          </div>

          {notice && <div className={styles.notice} role="status"><Check size={15} />{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={14} /></button></div>}

          <section className={styles.metrics} aria-label="Resumo da agenda">
            <article className={styles.metricCard}><span className={`${styles.metricIcon} ${styles.blueIcon}`}><CalendarDays size={17} /></span><div><small>Compromissos na semana</small><strong>{countThisWeek.toString().padStart(2, '0')}</strong><span>na programação</span></div><ArrowUpRight className={styles.metricTrend} size={16} /></article>
            <article className={styles.metricCard}><span className={`${styles.metricIcon} ${styles.tealIcon}`}><Ship size={17} /></span><div><small>Docagens programadas</small><strong>{dockingsThisWeek.toString().padStart(2, '0')}</strong><span>berço e área técnica</span></div><span className={styles.metricFootIcon}><Anchor size={16} /></span></article>
            <article className={styles.metricCard}><span className={`${styles.metricIcon} ${styles.greenIcon}`}><Wrench size={17} /></span><div><small>Equipes escaladas</small><strong>{assignedTeams.toString().padStart(2, '0')}<i> / 03</i></strong><span>times mobilizados</span></div><span className={styles.availability}><i />Em operação</span></article>
            <article className={`${styles.metricCard} ${styles.capacityCard}`}><span className={`${styles.metricIcon} ${styles.amberIcon}`}><Clock3 size={17} /></span><div><small>Janelas livres</small><strong>{Math.max(0, 24 - countThisWeek).toString().padStart(2, '0')}</strong><span>horários para encaixe</span></div><button onClick={() => setView('Dia')}>Ver disponibilidade <ChevronRight size={13} /></button></article>
          </section>

          <section className={styles.workspace} aria-label="Planejamento semanal">
            <div className={styles.calendarPanel}>
              <div className={styles.calendarToolbar}>
                <div className={styles.periodControl}>
                  <button className={styles.todayButton} onClick={() => setFocusDate(DEMO_DATE)}>Hoje</button>
                  <div className={styles.arrowGroup}>
                    <button onClick={() => moveWeek(-1)} aria-label={view === 'Dia' ? 'Dia anterior' : 'Semana anterior'}><ChevronLeft size={16} /></button>
                    <button onClick={() => moveWeek(1)} aria-label={view === 'Dia' ? 'Próximo dia' : 'Próxima semana'}><ChevronRight size={16} /></button>
                  </div>
                  <div className={styles.periodTitle}><h2>{weekLabel}</h2><span>{`${shortDate(days[0])} — ${shortDate(days[6])}`}</span></div>
                </div>
                <div className={styles.toolbarActions}>
                  <label className={styles.search}><Search size={14} /><input aria-label="Buscar na agenda" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar serviço..." />{query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca"><X size={13} /></button>}</label>
                  <div className={styles.viewSwitch} aria-label="Visualização da agenda">
                    {(['Semana', 'Dia'] as const).map(option => <button key={option} aria-pressed={view === option} className={view === option ? styles.activeView : ''} onClick={() => setView(option)}>{option}</button>)}
                  </div>
                </div>
              </div>
              <div className={styles.filters} role="group" aria-label="Filtrar por tipo de serviço">
                <span><SlidersHorizontal size={13} /> Tipo:</span>
                {CATEGORY_LABELS.map(item => <button key={item} className={category === item ? styles.activeFilter : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}{item === 'Todas' && <span>{countThisWeek}</span>}</button>)}
                <select className={styles.teamFilter} aria-label="Filtrar por equipe" value={teamFilter} onChange={event => setTeamFilter(event.target.value)}><option>Todas as equipes</option>{TEAMS.map(team => <option key={team}>{team}</option>)}</select>
              </div>
              <div className={`${styles.calendarScroll} ${view === 'Dia' ? styles.dayView : ''}`}>
                <div className={styles.calendarGrid} style={{ '--day-count': shownDays.length } as React.CSSProperties}>
                  <div className={styles.timeColumn}>
                    <div className={styles.timeHeader}><Clock3 size={13} /></div>
                    {TIMES.map(time => <div className={styles.timeLabel} key={time}>{time}</div>)}
                  </div>
                  {shownDays.map((day, index) => {
                    const key = dateKey(day)
                    const isFocused = key === dateKey(focusDate)
                    const itemsForDay = visibleEvents.filter(item => item.date === key)
                    return <div className={`${styles.dayColumn} ${isFocused ? styles.focusedDay : ''}`} key={key}>
                      <button className={`${styles.dayHeader} ${isFocused ? styles.selectedDay : ''}`} onClick={() => setFocusDate(day)} aria-pressed={isFocused}>
                        <span>{WEEKDAYS[days.findIndex(item => dateKey(item) === key) ?? index]}</span><strong>{day.getDate()}</strong><small>{itemsForDay.length ? `${itemsForDay.length} itens` : 'Livre'}</small>
                      </button>
                      <div className={styles.daySlots}>
                        {TIMES.map((time, slotIndex) => {
                          const items = itemsForDay.filter(item => eventSlot(item.time) === slotIndex)
                          return <div className={styles.slot} key={time}>
                            {items.length === 0 && <button className={styles.emptySlot} onClick={() => openNewEvent(day, time)} aria-label={`Criar compromisso em ${longDate(day)} às ${time}`}><Plus size={14} /><span>Adicionar horário</span></button>}
                            {items.map(item => <button key={`${item.id}-${item.vessel}-${item.time}`} className={`${styles.event} ${items.length > 1 ? styles.overlapEvent : ''} ${styles[kindClass(item.kind)]}`} onClick={() => openEventDetails(item)} aria-label={`${item.time}, ${item.vessel}, ${item.service}, ${item.team}`}>
                              <span className={styles.eventTime}>{item.time}<i /></span><strong>{item.vessel}</strong><span className={styles.eventService}>{item.service}</span><small>{item.team}</small>
                            </button>)}
                          </div>
                        })}
                      </div>
                    </div>
                  })}
                </div>
              </div>
              <div className={styles.calendarLegend}><span><i className={styles.legendMotor} />Manutenção</span><span><i className={styles.legendInspection} />Inspeção</span><span><i className={styles.legendDock} />Docagem</span><span><i className={styles.legendDelivery} />Entrega</span><span className={styles.operatingHours}>Horário da oficina <strong>08:00 — 18:00</strong></span></div>
            </div>

            <aside className={styles.sideRail}>
              <section className={styles.dayPanel}>
                <div className={styles.sideHeading}><div><span className={styles.sideEyebrow}>SELEÇÃO DO DIA</span><h2>{longDate(focusDate)}</h2></div><button aria-label="Adicionar compromisso neste dia" onClick={() => openNewEvent()}><Plus size={16} /></button></div>
                <div className={styles.daySummary}><span><CalendarDays size={14} />{dayEvents.length} compromissos</span><span><Clock3 size={14} />Dia produtivo</span></div>
                {dayEvents.length ? <div className={styles.timeline}>{dayEvents.map((item, index) => <button className={styles.timelineItem} key={`${item.id}-${item.vessel}-${item.time}`} onClick={() => openEventDetails(item)}>
                  <span className={styles.timelineTime}>{item.time}</span><span className={`${styles.timelineRail} ${styles[kindClass(item.kind)]}`}><i /></span><span className={styles.timelineCopy}><strong>{item.vessel}</strong><small>{item.service}</small><span><Wrench size={11} />{item.team}</span></span><ChevronRight size={14} className={styles.timelineArrow} />{index < dayEvents.length - 1 && <span className={styles.timelineLine} />}
                </button>)}</div> : <div className={styles.emptyDay}><CalendarDays size={20} /><strong>Dia sem compromissos</strong><span>Aproveite para organizar uma nova manutenção.</span><button onClick={() => openNewEvent()}>Adicionar à agenda</button></div>}
              </section>

              <section className={styles.tideCard}>
                <div className={styles.tideTop}><span className={styles.tideIcon}><Waves size={17} /></span><span><small>CONDIÇÕES DO PORTO</small><strong>Janela de maré</strong></span><button aria-label="Mais informações sobre a maré"><ArrowUpRight size={15} /></button></div>
                <div className={styles.tideGraphic} aria-label="Maré subindo até 1,8 metros às 10:42"><span>2,0 m</span><div className={styles.tideWave}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span>0 m</span><div className={styles.tideNow}><i /><small>08:00</small></div><div className={styles.tidePeak}><i /><small>10:42</small></div><div className={styles.tideEnd}><i /><small>14:00</small></div></div>
                <div className={styles.tideFooter}><span><ArrowUpRight size={14} /> Maré alta <strong>1,8 m</strong></span><span>10:42</span></div>
                <div className={styles.tideTip}><Compass size={13} /><span>Boa janela para saída de teste entre <strong>10:00 e 12:30</strong>.</span></div>
              </section>

              <section className={styles.teamsCard}>
                <div className={styles.teamsHeading}><div><h2>Equipes em operação</h2><span>Disponibilidade para esta semana</span></div><button aria-label="Ver equipes"><ArrowRight size={15} /></button></div>
                {[['Alfa', 'Motor e propulsão', '2 técnicos', 'blue'], ['Bravo', 'Sistemas hidráulicos', '3 técnicos', 'teal'], ['Charlie', 'Elétrica e docagem', '2 técnicos', 'amber']].map(([name, specialty, count, tone]) => <div className={styles.teamRow} key={name}><span className={`${styles.teamMark} ${styles[`team${tone}`]}`}><Wrench size={14} /></span><span className={styles.teamCopy}><strong>Equipe {name}</strong><small>{specialty}</small></span><span className={styles.teamCount}>{count}</span><i className={styles.teamOnline} /></div>)}
                <button className={styles.teamFooter} onClick={() => { setTeamFilter('Todas as equipes'); setQuery(''); setView('Semana') }}>Ver escala completa <ArrowRight size={13} /></button>
              </section>
            </aside>
          </section>
          <footer className={styles.footer}><span>MARÉOS <i>·</i> Planejamento com rumo certo.</span><span><i /> Dados de demonstração</span></footer>
        </div>
      </main>

      {newEventOpen && <div className={`${styles.modalBackdrop} ${styles.drawerBackdrop}`} onMouseDown={event => { if (event.target === event.currentTarget) closeDialog() }}>
        <section className={`${styles.dialog} ${styles.newEventDrawer}`} data-agenda-dialog role="dialog" aria-modal="true" aria-labelledby="new-event-title">
          <header className={styles.dialogHeader}><div><span>NOVO COMPROMISSO</span><h2 id="new-event-title">Adicionar à agenda</h2><p>Reserve um horário para a embarcação e equipe.</p></div><button onClick={closeDialog} aria-label="Fechar"><X size={18} /></button></header>
          <form onSubmit={createEvent} className={styles.eventForm}>
            <label>Embarcação<select required value={form.vessel} onChange={event => setForm({ ...form, vessel: event.target.value })}><option value="" disabled>Selecione a embarcação</option>{VESSELS.map(vessel => <option key={vessel}>{vessel}</option>)}</select></label>
            <label>Serviço<input required value={form.service} onChange={event => setForm({ ...form, service: event.target.value })} placeholder="Ex.: Revisão do motor" /></label>
            <div className={styles.formRow}><label>Data<input required type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></label><label>Horário<input required type="time" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} /></label></div>
            <div className={styles.formRow}><label>Tipo de serviço<select value={form.kind} onChange={event => setForm({ ...form, kind: event.target.value as ScheduleEvent['kind'] })}>{['Motor', 'Hidráulica', 'Elétrica', 'Docagem', 'Inspeção', 'Entrega'].map(kind => <option key={kind}>{kind}</option>)}</select></label><label>Equipe responsável<select value={form.team} onChange={event => setForm({ ...form, team: event.target.value })}>{TEAMS.map(team => <option key={team}>{team}</option>)}</select></label></div>
            <div className={styles.dialogActions}><button type="button" className={styles.cancelButton} onClick={closeDialog}>Cancelar</button><button type="submit" className="primary-btn"><Plus size={15} /> Agendar serviço</button></div>
          </form>
        </section>
      </div>}

      {selectedEvent && <div className={styles.modalBackdrop} onMouseDown={event => { if (event.target === event.currentTarget) closeDialog() }}>
        <section className={styles.dialog} data-agenda-dialog role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
          <header className={styles.dialogHeader}><div><span>DETALHES DO COMPROMISSO</span><h2 id="event-detail-title">{selectedEvent.vessel}</h2><p>{selectedEvent.service}</p></div><button onClick={closeDialog} aria-label="Fechar"><X size={18} /></button></header>
          <div className={styles.eventDetail}><span><CalendarDays size={15} />{longDate(dateFromKey(selectedEvent.date))}</span><span><Clock3 size={15} />{selectedEvent.time} · Oficina principal</span><span><Wrench size={15} />{selectedEvent.team}</span><span><Sparkles size={15} />{selectedEvent.kind} · {selectedEvent.status}</span><strong>{selectedEvent.id}</strong></div>
          <div className={styles.dialogActions}><button className={styles.cancelButton} onClick={closeDialog}>Fechar</button><button className="primary-btn" onClick={() => { setFocusDate(dateFromKey(selectedEvent.date)); closeDialog() }}>Ver no calendário <CalendarDays size={15} /></button></div>
        </section>
      </div>}
    </div>
  )
}
