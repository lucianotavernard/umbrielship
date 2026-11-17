'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Anchor, Bell, Building2, CalendarDays, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, ClipboardList, LayoutDashboard, LifeBuoy, Moon, MoreHorizontal, Ship, Sun, Users, Wrench } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, SidebarTrigger } from '@/components/ui/sidebar'
import { useOrganizationSelection } from '@/components/organizations/organization-selection'
import { useTheme } from '@/components/theme-provider'

type AppSidebarProps = {
  activePage: 'overview' | 'orders' | 'vessels' | 'clients' | 'agenda' | 'team' | 'inspections' | 'organizations'
}

const navigation = [
  { label: 'Visão geral', href: '/', icon: LayoutDashboard, page: 'overview' },
  { label: 'Ordens de serviço', href: '/ordens-servico', icon: ClipboardList, page: 'orders', count: '12' },
  { label: 'Inspeções', href: '/inspecoes', icon: ClipboardCheck, page: 'inspections' },
  { label: 'Embarcações', href: '/embarcacoes', icon: Ship, page: 'vessels' },
  { label: 'Clientes', href: '/clientes', icon: Users, page: 'clients' },
  { label: 'Agenda', href: '/agenda', icon: CalendarDays, page: 'agenda' },
  { label: 'Equipe técnica', href: '/equipe-tecnica', icon: Users, page: 'team' },
  { label: 'Organizações', href: '/organizacoes', icon: Building2, page: 'organizations' },
  { label: 'Estoque e peças', href: '/#estoque', icon: Wrench },
]

export function AppSidebar({ activePage }: AppSidebarProps) {
  const [organizationMenuOpen, setOrganizationMenuOpen] = useState(false)
  const { organizations, selectedOrganizationId, setSelectedOrganizationId } = useOrganizationSelection()
  const selectedOrganization = organizations.find(organization => organization.id === selectedOrganizationId) ?? organizations[0]

  return <Sidebar className="app-sidebar">
    <SidebarHeader className="sidebar-header">
      <div className="brand"><span className="brand-mark"><Anchor size={19}/></span><span className="brand-name">MARÉ<span>OS</span></span><SidebarTrigger className="collapse" aria-label="Recolher menu" /></div>
      <div className="workspace"><DropdownMenu open={organizationMenuOpen} onOpenChange={setOrganizationMenuOpen}><DropdownMenuTrigger render={<button type="button" className="workspace-trigger" aria-label="Selecionar organização" />}><span className="workspace-icon">{selectedOrganization.initials}</span><span><strong>{selectedOrganization.name}</strong><small>{selectedOrganization.detail}</small></span><ChevronDown size={14} className="workspace-chevron"/></DropdownMenuTrigger><DropdownMenuContent align="start" sideOffset={8} className="workspace-menu"><DropdownMenuGroup><DropdownMenuLabel>Trocar organização</DropdownMenuLabel></DropdownMenuGroup><DropdownMenuRadioGroup value={selectedOrganizationId} onValueChange={organizationId => { setSelectedOrganizationId(organizationId); setOrganizationMenuOpen(false) }}>{organizations.map(organization => <DropdownMenuRadioItem key={organization.id} value={organization.id} className="workspace-option"><span className="workspace-option-avatar" aria-hidden="true">{organization.initials}</span><span className="workspace-option-text"><strong>{organization.name}</strong><small>{organization.detail}</small></span></DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu></div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup className="sidebar-nav-group"><SidebarGroupLabel className="nav-label">MENU PRINCIPAL</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{navigation.map(({ label, href, icon: Icon, page, count }) => <SidebarMenuItem key={label}><SidebarMenuButton render={<Link href={href} aria-current={page === activePage ? 'page' : undefined}/>} isActive={page === activePage} tooltip={label}><Icon/><span>{label}</span>{count && <span className="nav-count">{count}</span>}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>
      <SidebarGroup className="sidebar-nav-group"><SidebarGroupLabel className="nav-label">GESTÃO</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/#relatorios"/>} tooltip="Relatórios"><Wrench/><span>Relatórios</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup>
    </SidebarContent>
    <SidebarFooter className="sidebar-footer"><div className="help-card"><LifeBuoy size={17} className="help-icon"/><strong>Precisa de ajuda?</strong><p>Fale com nosso time de suporte.</p><button type="button">Falar com suporte <ChevronRight size={14}/></button></div><SidebarSeparator/><div className="profile"><div className="avatar profile-avatar">LC</div><span><strong>Lucas Costa</strong><small>Administrador</small></span><MoreHorizontal size={19} className="profile-more"/></div></SidebarFooter>
  </Sidebar>
}

const initialNotifications = [
  { title: 'Ordem de serviço atualizada', detail: 'OS-2025-084 · Motor principal', time: 'Há 12 min' },
  { title: 'Inspeção agendada', detail: 'Veleiro Aurora · Hoje, 14:30', time: 'Há 1 h' },
  { title: 'Peças aguardando aprovação', detail: '3 itens para a embarcação Maré Alta', time: 'Há 3 h' },
]

export function AppTopbar({ section }: { section: string }) {
  const { theme, toggleTheme } = useTheme()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true)

  return <header className="topbar"><div className="breadcrumb"><SidebarTrigger className="mobile-menu" aria-label="Abrir menu"/><span>Operação</span><ChevronRight size={14}/><strong>{section}</strong></div><div className="top-actions"><span className="today-label"><span className="live-dot"/>Oficina em operação</span><button className="icon-btn" aria-label="Ajuda"><CircleHelp size={18}/></button><button type="button" className="icon-btn theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button><DropdownMenu open={notificationsOpen} onOpenChange={open => { setNotificationsOpen(open); if (open) setHasUnreadNotifications(false) }}><DropdownMenuTrigger render={<button type="button" className="icon-btn notification" aria-label="Notificações" aria-haspopup="menu" aria-expanded={notificationsOpen} />}><Bell size={18}/>{hasUnreadNotifications && <i/>}</DropdownMenuTrigger><DropdownMenuContent align="end" sideOffset={10} className="notification-menu"><DropdownMenuGroup><div className="notification-heading"><DropdownMenuLabel>Notificações</DropdownMenuLabel><span>{hasUnreadNotifications ? 'Novas' : 'Atualizadas'}</span></div>{initialNotifications.map(notification => <DropdownMenuItem key={notification.title} className="notification-item"><span className="notification-dot" aria-hidden="true"/><span className="notification-copy"><strong>{notification.title}</strong><small>{notification.detail}</small></span><time>{notification.time}</time></DropdownMenuItem>)}</DropdownMenuGroup><div className="notification-footer">Você está em dia com a operação</div></DropdownMenuContent></DropdownMenu><div className="top-divider"/><div className="avatar top-avatar">LC</div></div></header>
}
