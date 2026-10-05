import { AllEpicsResponse, BacklogItemApiModel } from '../models/reponse/backlog-response.model';
import { PlanQuarter } from '../models/reponse/plan-quarter.response';
import { QuarterPlansDashboardResponse } from '../models/reponse/quarter-plans-dashboard.response';
import { fail, FixtureRequest, FixtureResult, FixtureRoute } from './fixture.model';

/**
 * Q Plan Dashboard filtered by quarter. Unlike most endpoints these return bare JSON
 * (no `ApiResponse` envelope); only errors use the envelope.
 * Numbers are generated from the quarter name, so each quarter looks different but stable.
 */
const QUARTERS: PlanQuarter[] = [
  quarter('2026_Q2', '2026-04-01', '2026-06-30'),
  quarter('2026_Q3', '2026-07-01', '2026-09-30'),
  quarter('2026_Q4', '2026-10-01', '2026-12-31', true),
];

const AREAS = ['Portal', 'Integration', 'Mobile', 'Data Platform', 'Internal Tools'];
const TASK_TYPES = ['Feature Development', 'Enhancement', 'Bug Fixing', 'Support', 'Research'];
const HEALTH = ['On Track', 'At Risk', 'Off Track'];

const hierarchyCache = new Map<string, BacklogItemApiModel[]>();

export const quarterPlansFixtures: FixtureRoute[] = [
  { method: 'GET', path: 'dashboard/quarters', handle: () => json(QUARTERS) },
  {
    method: 'GET',
    path: 'dashboard',
    handle: (request) => withQuarter(request, (q) => json(dashboard(q))),
  },
  {
    method: 'GET',
    path: 'dashboard/hierarchy',
    handle: (request) =>
      withQuarter(request, (q) => {
        const pageNumber = Math.max(1, Number(request.query.get('pageNumber')) || 1);
        const pageSize = Math.max(1, Number(request.query.get('pageSize')) || 20);
        const epics = hierarchy(q);
        const totalPages = Math.ceil(epics.length / pageSize);
        const page: AllEpicsResponse = {
          items: structuredClone(epics.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)),
          pageNumber,
          pageSize,
          totalCount: epics.length,
          totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages,
        };
        return json(page);
      }),
  },
];

/** Resolves `?quarter=`. An unknown name is a 404 that lists the valid ones, as on the server. */
function withQuarter(
  { query }: FixtureRequest,
  handle: (quarter: PlanQuarter | null) => FixtureResult,
): FixtureResult {
  const name = query.get('quarter');
  if (!name) return handle(null);
  const found = QUARTERS.find((q) => q.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    const message = `Quarter '${name}' was not found. Valid quarters: ${QUARTERS.map((q) => q.name).join(', ')}.`;
    return fail(404, message, [message]);
  }
  return handle(found);
}

function dashboard(q: PlanQuarter | null): QuarterPlansDashboardResponse {
  const int = seeded(q?.name ?? 'all-quarters');
  const storiesCount = int(150, 400);
  const techStoryCount = int(40, 140);
  const executionNewCount = int(100, 400);
  const executionActiveCount = int(100, 350);
  const executionClosedCount = int(600, 1800);
  const totalChildrenCount = executionNewCount + executionActiveCount + executionClosedCount;
  const totalEffort = int(12_000, 36_000);
  const totalCompleted = int(Math.round(totalEffort * 0.1), Math.round(totalEffort * 0.9));
  const totalStoryPoints = int(300, 900);
  const closedStoryPoints = int(Math.round(totalStoryPoints * 0.2), totalStoryPoints);

  return {
    quarter: q,
    epicsCount: hierarchy(q).length,
    featuresCount: int(120, 320),
    storiesCount,
    totalStoriesCount: storiesCount + techStoryCount,
    bugsCount: int(300, 900),
    testCaseCount: int(500, 1300),
    meetingsCount: int(150, 450),
    techStoryCount,
    supportCount: int(10, 60),
    threadCount: int(10, 60),
    tasksCount: int(800, 1600),
    childrenOfFeaturesCount: int(250, 500),
    totalChildrenCount,
    executionNewCount,
    executionActiveCount,
    executionClosedCount,
    executionCompletionPercent: (executionClosedCount / totalChildrenCount) * 100,
    unlinkedEpicsCount: int(0, 5),
    unlinkedFeaturesCount: int(10, 80),
    totalEffort,
    totalStoryPoints,
    totalCompleted,
    totalRemaining: totalEffort - totalCompleted,
    closedEffort: int(200, 900),
    closedStoryPoints,
    completionPercentEffort: Math.round((totalCompleted / totalEffort) * 100),
    completionPercentSP: Math.round((closedStoryPoints / totalStoryPoints) * 100),
    epicsByArea: AREAS.map((area) => ({
      area: `Enterprise Quarterly Planning\\${area}`,
      ...breakdown(int),
    })),
    epicsByTaskType: TASK_TYPES.map((taskType) => ({ taskType, ...breakdown(int) })),
  };
}

function breakdown(int: (min: number, max: number) => number) {
  const notStarted = int(0, 8);
  const inProgress = int(0, 10);
  const closed = int(0, 12);
  const total = notStarted + inProgress + closed;
  return {
    total,
    notStarted,
    inProgress,
    closed,
    completionPercent: total ? Math.round((closed / total) * 1000) / 10 : 0,
  };
}

/** Epic → Feature → User Story → Task, generated once per quarter. */
function hierarchy(q: PlanQuarter | null): BacklogItemApiModel[] {
  const key = q?.name ?? '';
  const cached = hierarchyCache.get(key);
  if (cached) return cached;

  const int = seeded(`${key}-hierarchy`);
  let nextId = 50_000 + int(0, 9) * 1_000;
  const label = q?.name ?? 'All quarters';
  const types = ['Epic', 'Feature', 'User Story', 'Task'];

  const item = (level: number, title: string): BacklogItemApiModel => {
    const children =
      level < types.length - 1
        ? Array.from({ length: int(0, 3) }, (_, i) => item(level + 1, `${title}.${i + 1}`))
        : [];
    const effort = children.length
      ? children.reduce((sum, child) => sum + child.effort, 0)
      : int(2, 40);
    const completedWork = children.length
      ? children.reduce((sum, child) => sum + child.completedWork, 0)
      : int(0, effort);
    return {
      id: nextId++,
      title: `[${label}] ${types[level]} ${title}`,
      type: types[level],
      state: completedWork === 0 ? 'New' : completedWork >= effort ? 'Closed' : 'Active',
      effort,
      completedWork,
      remainingWork: effort - completedWork,
      healthStatus: HEALTH[int(0, HEALTH.length - 1)],
      children,
    };
  };

  const epics = Array.from({ length: q ? int(12, 34) : 60 }, (_, i) => item(0, `${i + 1}`));
  hierarchyCache.set(key, epics);
  return epics;
}

/** Integer generator seeded by a string (mulberry32), so a quarter always gets the same data. */
function seeded(seed: string): (min: number, max: number) => number {
  let state = [...seed].reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16_777_619),
    2_166_136_261,
  );
  return (min, max) => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const unit = ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    return Math.floor(min + unit * (max - min + 1));
  };
}

function quarter(name: string, startDate: string, endDate: string, isCurrent = false): PlanQuarter {
  return {
    name,
    iterationPath: `Enterprise Quarterly Planning\\${name}`,
    startDate,
    endDate,
    isCurrent,
  };
}

function json(body: unknown): FixtureResult {
  return { status: 200, body: structuredClone(body) };
}
