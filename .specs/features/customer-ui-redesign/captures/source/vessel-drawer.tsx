'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Anchor, Check, Ruler, Ship, X } from 'lucide-react'

export type VesselStatus = 'Ativa' | 'Em manutenção' | 'Inativa'

export type Vessel = {
  id: string
  name: string
  owner: string
  imo: string
  type: string
  length: number
  port: string
  status: VesselStatus
}

export type VesselFormValues = Omit<Vessel, 'id'>

type VesselDrawerProps = {
  open: boolean
  vessel: Vessel | null
  onClose: () => void
  onSave: (values: VesselFormValues) => void
}

const emptyForm: VesselFormValues = {
  name: '',
  owner: '',
  imo: '',
  type: '',
  length: 0,
  port: '',
  status: 'Ativa',
}

export function VesselDrawer({ open, vessel, onClose, onSave }: VesselDrawerProps) {
  const [form, setForm] = useState<VesselFormValues>(emptyForm)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setForm(vessel ? { name: vessel.name, owner: vessel.owner, imo: vessel.imo, type: vessel.type, length: vessel.length, port: vessel.port, status: vessel.status } : emptyForm)
    firstFieldRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = document.querySelectorAll<HTMLElement>('.vessel-drawer button:not([disabled]), .vessel-drawer input:not([disabled]), .vessel-drawer select:not([disabled])')
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
  }, [open, vessel, onClose])

  function updateField<Key extends keyof VesselFormValues>(key: Key, value: VesselFormValues[Key]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ ...form, name: form.name.trim(), owner: form.owner.trim(), port: form.port.trim(), imo: form.imo.trim() })
  }

  if (!open) return null

  return <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><aside className="workorder-drawer vessel-drawer" role="dialog" aria-modal="true" aria-labelledby="vessel-drawer-title" aria-describedby="vessel-drawer-description"><header className="drawer-header"><div><div className="drawer-kicker">FROTA / EMBARCAÇÕES</div><h2 id="vessel-drawer-title">{vessel ? 'Editar embarcação' : 'Nova embarcação'}</h2><p id="vessel-drawer-description">{vessel ? 'Atualize as informações cadastrais e operacionais desta embarcação.' : 'Preencha os dados abaixo para registrar uma embarcação na frota.'}</p></div><button type="button" className="drawer-close" aria-label="Fechar formulário" onClick={onClose}><X size={18}/></button></header><form className="new-order-form" onSubmit={handleSubmit}><div className="drawer-sections"><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><Ship size={17}/></span><span><strong>Detalhes da embarcação</strong><small>Informações básicas sobre a embarcação</small></span></header><div className="form-card-fields vessel-fields-grid"><label className="form-field form-field-wide"><span>Nome <b>*</b></span><input ref={firstFieldRef} required maxLength={80} value={form.name} onChange={event => updateField('name', event.target.value)} placeholder="Ex.: Aurora"/></label><label className="form-field form-field-wide"><span>Cliente responsável <b>*</b></span><input required maxLength={100} value={form.owner} onChange={event => updateField('owner', event.target.value)} placeholder="Nome do cliente ou empresa"/></label></div></section><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><Ruler size={17}/></span><span><strong>Tipo e comprimento</strong><small>Identificação e dimensões da embarcação</small></span></header><div className="form-card-fields vessel-fields-grid"><label className="form-field form-field-wide"><span>Número IMO</span><input inputMode="numeric" pattern="[0-9]{7}" maxLength={7} value={form.imo} onChange={event => updateField('imo', event.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="Ex.: 1234567" title="Informe os 7 dígitos do número IMO"/></label><label className="form-field"><span>Tipo de embarcação <b>*</b></span><select required value={form.type} onChange={event => updateField('type', event.target.value)}><option value="" disabled>Selecione o tipo</option>{['Barco pesqueiro','Traineira','Barco de apoio','Lancha','Rebocador','Outro'].map(type => <option key={type} value={type}>{type}</option>)}</select></label><label className="form-field"><span>Comprimento (m) <b>*</b></span><input required type="number" min="1" max="500" step="0.1" value={form.length || ''} onChange={event => updateField('length', event.target.value === '' ? 0 : Number(event.target.value))} placeholder="Ex.: 32,5"/></label></div></section><section className="form-card"><header className="form-card-heading"><span className="form-card-icon"><Anchor size={17}/></span><span><strong>Operação</strong><small>Localização e situação atual da frota</small></span></header><div className="form-card-fields vessel-fields-grid"><label className="form-field"><span>Porto base</span><input maxLength={80} value={form.port} onChange={event => updateField('port', event.target.value)} placeholder="Ex.: Santos, SP"/></label><label className="form-field"><span>Status</span><select value={form.status} onChange={event => updateField('status', event.target.value as VesselStatus)}><option>Ativa</option><option>Em manutenção</option><option>Inativa</option></select></label></div></section></div><footer className="drawer-footer"><span className="required-note"><b>*</b> Campos obrigatórios</span><div className="drawer-actions"><button type="button" className="outline-btn" onClick={onClose}><X size={14}/> Cancelar</button><button type="submit" className="primary-btn"><Check size={15}/>{vessel ? 'Salvar alterações' : 'Salvar embarcação'}</button></div></footer></form></aside></div>
}
