import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ComingSoon } from '../coming-soon';

describe('ComingSoon', () => {
  it('user-menu C2 shows the page header the route gives and says the area comes soon', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ComingSoon);
    fixture.componentRef.setInput('eyebrow', 'CONTA / PERFIL');
    fixture.componentRef.setInput('heading', 'Conta');
    fixture.componentRef.setInput('description', 'Seus dados de acesso e preferências.');
    fixture.componentRef.setInput('icon', 'lucideCircleUser');
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const squash = (node: Element | null) => node?.textContent?.replace(/\s+/g, ' ').trim();

    expect(squash(element.querySelector('h1'))).toBe('Conta');
    expect(element.textContent).toContain('CONTA / PERFIL');
    expect(element.textContent).toContain('Seus dados de acesso e preferências.');
    const card = element.querySelector('[data-slot="coming-soon"]')!;
    expect(squash(card.querySelector('h2'))).toBe('Em breve');
    expect(card.querySelector('ng-icon svg')).not.toBeNull();
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/dashboard');
  });
});
