export type EpicStatus = 'On Track' | 'At Risk' | 'Off Track';

export interface BaseWorkItem {
  id: string;
  title: string;
  effort: number;
  completed: number;
  remaining: number;
  status: EpicStatus;
}

export interface TaskItem extends BaseWorkItem {
  type: 'Task';
}

export interface StoryItem extends BaseWorkItem {
  type: 'User Story' | 'Technical User Story';
  tasks: TaskItem[];
}

export interface EpicFeature extends BaseWorkItem {
  type: 'Feature';
  stories: StoryItem[];
}

export interface Epic extends BaseWorkItem {
  type: 'Epic';
  features: EpicFeature[];
}

export const ALL_EPICS_MOCK: Epic[] = [
  {
    id: 'EP-001',
    title: 'Quarter Plan',
    effort: 402,
    completed: 0,
    remaining: 402,
    status: 'Off Track',
    type: 'Epic',
    features: [
      {
        id: 'F-001',
        title: 'Roadmap Definition',
        effort: 120,
        completed: 0,
        remaining: 120,
        status: 'Off Track',
        type: 'Feature',
        stories: [
          {
            id: 'US-001',
            title: 'Define Q1 Goals',
            effort: 60,
            completed: 0,
            remaining: 60,
            status: 'Off Track',
            type: 'User Story',
            tasks: [
              { id: 'T-001', title: 'Draft OKRs', effort: 30, completed: 0, remaining: 30, status: 'Off Track', type: 'Task' },
              { id: 'T-002', title: 'Review with stakeholders', effort: 30, completed: 0, remaining: 30, status: 'Off Track', type: 'Task' }
            ]
          },
          {
            id: 'TS-001',
            title: 'Set up tracking dashboard',
            effort: 60,
            completed: 0,
            remaining: 60,
            status: 'Off Track',
            type: 'Technical User Story',
            tasks: [
              { id: 'T-003', title: 'DB Schema', effort: 40, completed: 0, remaining: 40, status: 'Off Track', type: 'Task' },
              { id: 'T-004', title: 'API Endpoints', effort: 20, completed: 0, remaining: 20, status: 'Off Track', type: 'Task' }
            ]
          }
        ]
      }
    ],
  },
  {
    id: 'EP-002',
    title: 'AI Training (Transformation)',
    effort: 1050,
    completed: 82,
    remaining: 968,
    status: 'Off Track',
    type: 'Epic',
    features: [
      {
        id: 'F-004',
        title: 'Model Fine-tuning',
        effort: 350,
        completed: 40,
        remaining: 310,
        status: 'Off Track',
        type: 'Feature',
        stories: [
          {
            id: 'TS-002',
            title: 'Prepare dataset',
            effort: 150,
            completed: 40,
            remaining: 110,
            status: 'At Risk',
            type: 'Technical User Story',
            tasks: [
              { id: 'T-005', title: 'Data cleaning', effort: 50, completed: 40, remaining: 10, status: 'On Track', type: 'Task' },
              { id: 'T-006', title: 'Data labeling', effort: 100, completed: 0, remaining: 100, status: 'Off Track', type: 'Task' }
            ]
          }
        ]
      }
    ],
  },
  {
    id: 'EP-003',
    title: 'Platform Modernization',
    effort: 3200,
    completed: 1100,
    remaining: 2100,
    status: 'At Risk',
    type: 'Epic',
    features: [
      {
        id: 'F-017',
        title: 'Microservices Migration',
        effort: 1200,
        completed: 500,
        remaining: 700,
        status: 'On Track',
        type: 'Feature',
        stories: [
          {
            id: 'TS-003',
            title: 'Migrate Auth Service',
            effort: 600,
            completed: 500,
            remaining: 100,
            status: 'On Track',
            type: 'Technical User Story',
            tasks: [
              { id: 'T-007', title: 'Extract logic', effort: 300, completed: 300, remaining: 0, status: 'On Track', type: 'Task' },
              { id: 'T-008', title: 'Deploy to K8s', effort: 300, completed: 200, remaining: 100, status: 'At Risk', type: 'Task' }
            ]
          }
        ]
      }
    ],
  }
];

export const ALL_EPICS_SUMMARY = {
  totalEffort: ALL_EPICS_MOCK.reduce((s, e) => s + e.effort, 0),
  totalCompleted: ALL_EPICS_MOCK.reduce((s, e) => s + e.completed, 0),
  totalRemaining: ALL_EPICS_MOCK.reduce((s, e) => s + e.remaining, 0),
};
