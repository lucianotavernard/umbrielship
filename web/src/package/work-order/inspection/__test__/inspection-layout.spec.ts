import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PAGE_RELOAD } from '../../../shared/components/lib/page-reload';
import { InternalLayout } from '../../../shared/components/internal-layout';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('Layout header on a phone', () => {
  it('inspection C32 the header is sticky from sm only', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PAGE_RELOAD, useValue: vi.fn() },
      ],
    });
    const fixture = TestBed.createComponent(InternalLayout);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).match(() => true);

    const classes = [...(fixture.nativeElement as HTMLElement).querySelector('header')!.classList];

    // Tailwind's sm breakpoint is 640 px: below it the header scrolls with the page.
    expect(classes).toEqual(expect.arrayContaining(['sm:sticky', 'sm:top-0']));
    expect(classes).not.toContain('sticky');
    expect(classes).not.toContain('top-0');
  });
});
