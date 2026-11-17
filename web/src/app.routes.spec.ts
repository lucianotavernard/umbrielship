import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Route,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

import { routes } from './app.routes';
import { AuthenticationService } from './package/identity/authentication/authentication.service';
import type { Role } from './package/identity/user/user.service';
import { authGuard } from './package/shared/components/lib/auth.guard';
import { inspectorGuard } from './package/shared/components/lib/inspector.guard';
import { InternalLayout } from './package/shared/components/internal-layout';
import { Agenda } from './package/work-order/agenda/agenda-page/agenda';
import { InspectionPage } from './package/work-order/inspection/inspection-page/inspection-page';
import { InspectionsHub } from './package/work-order/inspection/inspections-hub/inspections-hub';
import { InspectionTemplateDetail } from './package/work-order/inspection-template/inspection-template-detail/inspection-template-detail';
import { WorkOrderDetail } from './package/work-order/work-order/work-order-detail/work-order-detail';
import { WorkOrderList } from './package/work-order/work-order/work-order-list/work-order-list';

const INSPECT = 'work-orders/:id/assignments/:assignmentId/inspect';

const profile = (role: Role) => ({
  user: {
    id: 'user-1',
    name: 'Inês Prado',
    email: 'ines@atlantic.test',
    role,
    organization: { id: 'org-a', name: 'Atlantic', isInternal: false },
    organizations: [{ id: 'org-a', name: 'Atlantic', isInternal: false, role }],
  },
});

describe('routes', () => {
  let controller: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
        provideLocationMocks(),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    // A signed-in session: the authenticated layout lets the navigation in.
    TestBed.inject(AuthenticationService).isAuthenticated.set(true);
  });

  afterEach(() => controller.verify());

  /** The route that holds every page of the signed-in user, behind `authGuard`. */
  const layout = () => routes.find((route) => route.path === '' && route.children !== undefined)!;
  const child = (path: string) => layout().children!.find((route) => route.path === path);

  /** The route configs from the root to the page the router activated. */
  function activated(): { chain: (Route | null)[]; leaf: ActivatedRouteSnapshot } {
    let leaf = router.routerState.snapshot.root;
    const chain: (Route | null)[] = [];
    while (leaf.firstChild) {
      leaf = leaf.firstChild;
      chain.push(leaf.routeConfig);
    }
    return { chain, leaf };
  }

  async function navigate(url: string, me?: Role) {
    const navigation = router.navigateByUrl(url);
    if (me) {
      await new Promise((resolve) => setTimeout(resolve));
      controller.expectOne({ method: 'GET', url: '/api/me' }).flush(profile(me));
    }
    await navigation;
    await new Promise((resolve) => setTimeout(resolve));
  }

  it('work-order-ui C43 redirects the template list to the hub', async () => {
    expect(child('inspection-templates')).toEqual({
      path: 'inspection-templates',
      pathMatch: 'full',
      redirectTo: 'inspections',
    });

    await navigate('/inspection-templates');
    expect(router.url).toBe('/inspections');
    expect(activated().leaf.component).toBe(InspectionsHub);

    // A template's own page stays where it is.
    await navigate('/inspection-templates/t1');
    expect(router.url).toBe('/inspection-templates/t1');
    expect(activated().leaf.component).toBe(InspectionTemplateDetail);
  });

  it('work-order-ui C54 guards the inspect page for the inspector role', async () => {
    expect(child(INSPECT)?.canActivate).toEqual([inspectorGuard]);
    // Reading a completed Inspection is open to every Role.
    expect(
      child('work-orders/:id/assignments/:assignmentId/inspections/:inspectionId')?.canActivate,
    ).toBeUndefined();

    // The guard reads the Role from GET /me: only an inspector passes.
    for (const role of ['administrator', 'operator', 'inspector'] as const) {
      let result: boolean | UrlTree | undefined;
      const guarded = TestBed.runInInjectionContext(() =>
        inspectorGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<boolean | UrlTree>;
      guarded.subscribe((value) => (result = value));
      controller.expectOne({ method: 'GET', url: '/api/me' }).flush(profile(role));

      if (role === 'inspector') {
        expect(result, role).toBe(true);
      } else {
        expect(result, role).toBeInstanceOf(UrlTree);
        expect(router.serializeUrl(result as UrlTree), role).toBe('/forbidden');
      }
    }

    await navigate('/work-orders/wo-1/assignments/a1/inspect', 'operator');
    expect(router.url).toBe('/forbidden');

    await navigate('/work-orders/wo-1/assignments/a1/inspect', 'inspector');
    expect(router.url).toBe('/work-orders/wo-1/assignments/a1/inspect');
    expect(activated().leaf.component).toBe(InspectionPage);

    // An operator reads a completed Inspection with no call to GET /me.
    await navigate('/work-orders/wo-1/assignments/a1/inspections/i1');
    expect(router.url).toBe('/work-orders/wo-1/assignments/a1/inspections/i1');
  });

  it('work-order-ui C71 declares the work order, inspection and agenda routes in the authenticated layout', async () => {
    expect(layout().canActivate).toEqual([authGuard]);

    const pages: [path: string, url: string, page: Type<unknown>, me?: Role][] = [
      ['work-orders', '/work-orders', WorkOrderList],
      ['work-orders/:id', '/work-orders/wo-1', WorkOrderDetail],
      [INSPECT, '/work-orders/wo-1/assignments/a1/inspect', InspectionPage, 'inspector'],
      [
        'work-orders/:id/assignments/:assignmentId/inspections/:inspectionId',
        '/work-orders/wo-1/assignments/a1/inspections/i1',
        InspectionPage,
      ],
      ['inspections', '/inspections', InspectionsHub],
      ['inspection-templates/:id', '/inspection-templates/t1', InspectionTemplateDetail],
      ['agenda', '/agenda', Agenda],
    ];

    for (const [path, url, page, me] of pages) {
      expect(child(path), path).toBeDefined();

      await navigate(url, me);
      const { chain, leaf } = activated();
      expect(router.url, path).toBe(url);
      // The page is a child of the authenticated layout, one level down.
      expect(
        chain.map((route) => route?.path),
        path,
      ).toEqual(['', path]);
      expect(chain[0]?.canActivate, path).toEqual([authGuard]);
      expect(chain[0]?.loadComponent && (await chain[0].loadComponent()), path).toBe(
        InternalLayout,
      );
      expect(leaf.component, path).toBe(page);
    }
  });
});
