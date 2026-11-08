import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InvitationAccept } from '../invitation-accept/invitation-accept';

describe('InvitationAccept', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  async function open() {
    const fixture = TestBed.createComponent(InvitationAccept);
    fixture.componentRef.setInput('secret', 'abc');
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Aceitar convite');
    [...element.querySelectorAll('button')].find((button) => button.textContent?.includes('Aceitar convite'))?.click();
    await settle();
    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Confirmar')?.click();
    await settle();
    const request = controller.expectOne('/api/invitations/accept');
    expect(request.request.body).toEqual({ secret: 'abc' });
    return { element, request };
  }

  it('[C89] shows the organization name after 200', async () => {
    const { element, request } = await open();
    request.flush({ organizationName: 'Atlantic' });
    await settle();
    expect(element.textContent).toContain('Atlantic');
  });

  it('[C89] shows Convite não encontrado on 404', async () => {
    const { element, request } = await open();
    request.flush({ message: 'Invitation not found' }, { status: 404, statusText: 'Not Found' });
    await settle();
    expect(element.textContent).toContain('Convite não encontrado.');
  });

  it('[C89] shows Este convite já foi aceito on 409', async () => {
    const { element, request } = await open();
    request.flush({ message: 'Invitation already accepted' }, { status: 409, statusText: 'Conflict' });
    await settle();
    expect(element.textContent).toContain('Este convite já foi aceito.');
  });
});
