export enum Seniority {
  Intern = 1,
  Fresh = 2,
  Junior = 3,
  MidLevel = 4,
  Senior = 5,
  Lead = 6,
  Manager = 7,
}

export const Seniorities = [
  { value: Seniority.Intern, label: 'Intern' },
  { value: Seniority.Fresh, label: 'Fresh' },
  { value: Seniority.Junior, label: 'Junior' },
  { value: Seniority.MidLevel, label: 'Mid Level' },
  { value: Seniority.Senior, label: 'Senior' },
  { value: Seniority.Lead, label: 'Lead' },
  { value: Seniority.Manager, label: 'Manager' },
];