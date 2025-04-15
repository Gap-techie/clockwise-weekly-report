
import { Project, TimeEntry, Job, WeeklyTimeData, DailySummary, WeeklySummary } from './types';

// Constants
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Sample Projects
export const SAMPLE_PROJECTS: Project[] = [
  { id: 'proj-001', name: 'Website Redesign' },
  { id: 'proj-002', name: 'Mobile App Development' },
  { id: 'proj-003', name: 'Marketing Campaign' },
  { id: 'proj-004', name: 'Infrastructure Update' }
];

// Sample Jobs
export const SAMPLE_JOBS: Record<string, Job[]> = {
  'proj-001': [
    { id: 'job-001', code: 'DEV', title: 'Development' },
    { id: 'job-002', code: 'DES', title: 'Design' },
    { id: 'job-003', code: 'QA', title: 'Quality Assurance' }
  ],
  'proj-002': [
    { id: 'job-004', code: 'UI', title: 'UI Implementation' },
    { id: 'job-005', code: 'API', title: 'API Integration' },
    { id: 'job-006', code: 'TEST', title: 'Testing' }
  ],
  'proj-003': [
    { id: 'job-007', code: 'SOC', title: 'Social Media' },
    { id: 'job-008', code: 'EMAIL', title: 'Email Campaign' }
  ],
  'proj-004': [
    { id: 'job-009', code: 'SERVER', title: 'Server Upgrade' },
    { id: 'job-010', code: 'NET', title: 'Network Configuration' }
  ]
};

// Sample Time Entries
export const SAMPLE_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'entry-001',
    projectId: 'proj-001',
    jobId: 'job-001',
    jobCode: 'DEV',
    clockInTime: new Date(2023, 3, 10, 9, 0),
    clockOutTime: new Date(2023, 3, 10, 12, 30)
  },
  {
    id: 'entry-002',
    projectId: 'proj-002',
    jobId: 'job-004',
    jobCode: 'UI',
    clockInTime: new Date(2023, 3, 10, 13, 30),
    clockOutTime: new Date(2023, 3, 10, 17, 0)
  },
  {
    id: 'entry-003',
    projectId: 'proj-003',
    jobId: 'job-007',
    jobCode: 'SOC',
    clockInTime: new Date(2023, 3, 11, 8, 45),
    clockOutTime: null
  }
];

// Sample Weekly Time Data
export const SAMPLE_WEEKLY_DATA: WeeklyTimeData = {
  'Monday': {
    'Website Redesign/DEV': 3.5,
    'Mobile App/UI': 3.5
  },
  'Tuesday': {
    'Website Redesign/DEV': 4,
    'Marketing/SOC': 2,
    'Infrastructure/SERVER': 2
  },
  'Wednesday': {
    'Mobile App/API': 8
  },
  'Thursday': {
    'Website Redesign/QA': 4,
    'Marketing/EMAIL': 4
  },
  'Friday': {
    'Mobile App/TEST': 4,
    'Infrastructure/NET': 4
  },
  'Saturday': {},
  'Sunday': {}
};

// Sample Daily Summary
export const SAMPLE_DAILY_SUMMARY: DailySummary = {
  date: new Date(2023, 3, 10),
  regularHours: 7.5,
  overtimeHours: 0.5,
  totalHours: 8
};

// Sample Weekly Summary
export const SAMPLE_WEEKLY_SUMMARY: WeeklySummary = {
  startDate: new Date(2023, 3, 10),
  endDate: new Date(2023, 3, 16),
  days: {
    '2023-04-10': {
      date: new Date(2023, 3, 10),
      regularHours: 8,
      overtimeHours: 0,
      totalHours: 8
    },
    '2023-04-11': {
      date: new Date(2023, 3, 11),
      regularHours: 8,
      overtimeHours: 0,
      totalHours: 8
    },
    '2023-04-12': {
      date: new Date(2023, 3, 12),
      regularHours: 8,
      overtimeHours: 0,
      totalHours: 8
    },
    '2023-04-13': {
      date: new Date(2023, 3, 13),
      regularHours: 8,
      overtimeHours: 0,
      totalHours: 8
    },
    '2023-04-14': {
      date: new Date(2023, 3, 14),
      regularHours: 8,
      overtimeHours: 0,
      totalHours: 8
    }
  },
  regularHours: 40,
  overtimeHours: 0,
  totalHours: 40
};
