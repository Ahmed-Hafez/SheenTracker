import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { fixtureInterceptor } from './fixture.interceptor';
import { environment } from '../../../environments/environment';

describe('fixtureInterceptor', () => {
  let http: HttpClient;
  const api = (path: string) => environment.apiUrl + path;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([fixtureInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => vi.useRealTimers());

  async function settle<T>(promise: Promise<T>) {
    await vi.runAllTimersAsync();
    return promise;
  }

  /** Captures the error before the timers run, so the rejection is never unhandled. */
  async function settleError(promise: Promise<unknown>) {
    const caught = promise.then(
      () => null,
      (error: unknown) => error,
    );
    await vi.runAllTimersAsync();
    return caught;
  }

  it('serves a matching route in the ApiResponse envelope', async () => {
    const res = await settle(
      firstValueFrom(http.get<{ data: { key: string }[] }>(api('settings'))),
    );
    expect(res.data.map((s) => s.key)).toContain('DefaultExpectedHours');
  });

  it('matches :params case-insensitively and applies server rules on PUT', async () => {
    const saved = await settle(
      firstValueFrom(
        http.put<{ data: { value: string[] } }>(api('settings/excludedseniorities'), {
          value: [' midlevel ', 'MidLevel'],
        }),
      ),
    );
    expect(saved.data.value).toEqual(['MidLevel']);

    const rejected = await settleError(
      firstValueFrom(http.put(api('settings/DefaultExpectedHours'), { value: 65 })),
    );
    expect(rejected).toMatchObject({ status: 400 });
  });

  it('fails with 501 naming the call when no fixture exists', async () => {
    const missing = await settleError(firstValueFrom(http.get(api('dashboard/kpis?x=1'))));
    expect(missing).toMatchObject({
      status: 501,
      error: { message: 'No fixture for GET dashboard/kpis. Add one in src/app/core/fixtures.' },
    });
  });
});
