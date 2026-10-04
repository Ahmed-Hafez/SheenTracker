import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../core/http/backend_service/dashboard.service';
import { UsersService } from '../../core/http/backend_service/azure-users.service';

const users = [
  { userKey: 'a', displayName: 'Ada Zero', totalHours: 0, expectedHours: null },
  { userKey: 'b', displayName: 'Bo Full', totalHours: 1000, expectedHours: null },
];

function setup(overrides: { users?: unknown; projects?: unknown; performers?: unknown }) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: UsersService,
        useValue: {
          getAzureUsers: () => overrides.users ?? of({ users }),
          usersResponse$: () => ({ users }),
          users$: () => users,
        },
      },
      {
        provide: DashboardService,
        useValue: {
          getProjectsHours: () =>
            overrides.projects ?? of({ projectsCount: 1, totalHours: 10, projects: [] }),
          getTopPerformers: () => overrides.performers ?? of([]),
          getTargetAchievmentChartData: () => ({
            targetHours: 0,
            achievedHours: 0,
            percentage: 0,
          }),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(DashboardComponent);
  // Load directly: rendering the template would need a real canvas for the charts.
  fixture.componentInstance['reload']();
  return fixture.componentInstance;
}

describe('DashboardComponent load states', () => {
  it('marks only the failed source and finishes loading', () => {
    const component = setup({ projects: throwError(() => new Error('500')) });

    expect(component.loading()).toBe(false);
    expect(component.projectsFailed()).toBe(true);
    expect(component.usersFailed()).toBe(false);
    expect(component.performersFailed()).toBe(false);
    expect(component.projectsHours()).toBeNull();
  });

  it('lists users under 80% of expected hours, lowest first', () => {
    const component = setup({});

    expect(component.followUpRows().map((row) => row.userKey)).toEqual(['a']);
    expect(component.followUpRows()[0].percentage).toBe(0);
  });
});
