import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { catchError, from, map, mergeMap, of, toArray } from 'rxjs';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { clampPage, PAGE_SIZE } from '../../../shared/components/lib/paging';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { ListPager } from '../../../shared/components/ui/list-pager';
import { toast } from '../../../shared/components/ui/toaster';
import { OrganizationCreateSheet } from '../components/organization-create-sheet';
import { OrganizationList as OrganizationListUI } from '../components/organization-list';
import {
  GetOrganizationsResponse,
  OrganizationListItem,
  OrganizationService,
} from '../organization.service';

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** "Organizações" after "Lista de embarcações" (AD-111): the API pages and searches. */
@Component({
  selector: 'organization-list',
  imports: [NgIcon, Button, Confirmation, ListPager, OrganizationCreateSheet, OrganizationListUI],
  viewProviders: [provideIcons({ lucidePlus, lucideSearch, lucideTrash2, lucideX })],
  templateUrl: './organization-list.html',
})
export class OrganizationList {
  private readonly organizationService = inject(OrganizationService);

  readonly perPage = PAGE_SIZE;

  page = signal(1);
  search = signal('');
  isSheetActive = signal(false);

  /** The Organizations marked for "Excluir", kept by id across pages and searches. */
  selected = signal<ReadonlyMap<string, OrganizationListItem>>(new Map());
  /** The Organizations the confirmation is about; empty while it is closed. */
  deleting = signal<OrganizationListItem[]>([]);
  confirming = signal(false);

  private readonly organizationResource = httpResource<GetOrganizationsResponse>(() => {
    const term = this.search().trim();
    const query = term ? `&search=${encodeURIComponent(term)}` : '';
    return `/api/organizations?page=${this.page()}&per_page=${this.perPage}${query}`;
  });

  loading = computed(() => this.organizationResource.isLoading());
  organizations = computed(() => resourceValue(this.organizationResource)?.organizations ?? []);
  total = computed(() => resourceValue(this.organizationResource)?.total ?? 0);

  selectedIds = computed<ReadonlySet<string>>(() => new Set(this.selected().keys()));
  selectedCount = computed(() => this.selected().size);

  /** "3 organizações cadastradas", or how many the search finds. */
  summary = computed(() => {
    const total = this.total();
    if (this.search().trim()) {
      return `${total} ${plural(total, 'organização encontrada', 'organizações encontradas')}`;
    }
    return `${total} ${plural(total, 'organização cadastrada', 'organizações cadastradas')}`;
  });

  deleteLabel = computed(() => {
    const count = this.selectedCount();
    if (count === 0) return 'Selecione organizações para excluir';
    return `Excluir ${count} ${plural(count, 'organização selecionada', 'organizações selecionadas')}`;
  });

  confirmationTitle = computed(() =>
    this.deleting().length > 1 ? 'Excluir organizações' : 'Excluir organização',
  );
  confirmationDescription = computed(() => {
    const deleting = this.deleting();
    const what =
      deleting.length === 1
        ? `a organização ${deleting[0].name}`
        : `as ${deleting.length} organizações selecionadas`;
    return `Tem certeza que deseja excluir ${what}? Seus membros perdem o acesso e esta ação não pode ser desfeita.`;
  });

  /** A new search starts on page 1, set together so the API is asked once. */
  setSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  goTo(page: number) {
    this.page.set(clampPage(page, this.total(), this.perPage));
  }

  toggle(organization: OrganizationListItem) {
    if (organization.isInternal) return;
    this.selected.update((current) => {
      const next = new Map(current);
      if (next.has(organization.id)) next.delete(organization.id);
      else next.set(organization.id, organization);
      return next;
    });
  }

  /** Selects every Organization of the page but the internal one, or clears them when all are. */
  toggleShown() {
    const shown = this.organizations().filter((organization) => !organization.isInternal);
    this.selected.update((current) => {
      const next = new Map(current);
      const all = shown.length > 0 && shown.every((organization) => next.has(organization.id));
      for (const organization of shown) {
        if (all) next.delete(organization.id);
        else next.set(organization.id, organization);
      }
      return next;
    });
  }

  askDelete(organizations: OrganizationListItem[]) {
    if (organizations.length) this.deleting.set(organizations);
  }

  askDeleteSelected() {
    this.askDelete([...this.selected().values()]);
  }

  closeDialog() {
    if (this.confirming()) return;
    this.deleting.set([]);
  }

  /** Deletes each Organization on its own: one refused (409) leaves the others deleted. */
  deleteOrganizations() {
    const deleting = this.deleting();
    if (!deleting.length) return;
    this.confirming.set(true);

    from(deleting)
      .pipe(
        mergeMap((organization) =>
          this.organizationService.deleteOrganization(organization.id).pipe(
            map(() => ({ organization, error: null as HttpErrorResponse | null })),
            catchError((error: HttpErrorResponse) => of({ organization, error })),
          ),
        ),
        toArray(),
      )
      .subscribe((results) => {
        const deleted = results.filter((result) => !result.error).map((result) => result.organization);
        const refused = results.filter((result) => result.error);

        this.confirming.set(false);
        this.deleting.set([]);
        this.selected.update((current) => {
          const next = new Map(current);
          for (const organization of deleted) next.delete(organization.id);
          return next;
        });

        if (deleted.length) {
          toast.success(
            deleted.length === 1
              ? 'Organização excluída com sucesso'
              : `${deleted.length} organizações excluídas com sucesso`,
          );
          // A delete that empties the last page shows the one before it.
          const page = clampPage(this.page(), this.total() - deleted.length, this.perPage);
          if (page !== this.page()) this.page.set(page);
          else this.organizationResource.reload();
        }

        if (refused.length) {
          const records = refused.filter((result) => result.error?.status === 409);
          const names = refused.map((result) => result.organization.name).join(', ');
          toast.error(plural(refused.length, 'Erro ao excluir organização', 'Erro ao excluir organizações'), {
            description:
              records.length === refused.length
                ? `${names} ${plural(refused.length, 'tem', 'têm')} clientes, ordens de serviço, modelos de inspeção, profissionais ou equipes e não ${plural(refused.length, 'pode', 'podem')} ser ${plural(refused.length, 'excluída', 'excluídas')}.`
                : apiErrorMessage(refused[0].error as { error?: unknown }, `Ocorreu um erro ao excluir ${names}.`),
          });
        }
      });
  }

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  /** The drawer posted and toasted: it closes and the list shows the new Organization. */
  onCreated() {
    this.closeSheet();
    this.organizationResource.reload();
  }
}
