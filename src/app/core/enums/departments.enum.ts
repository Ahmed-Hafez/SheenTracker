export enum Department {
  Frontend = 1,
  Backend = 2,
  ProductManagement = 3,
  ScrumMaster = 4,
  QualityAssurance = 5,
  DevOps = 6,
  UIUXDesign = 7,
}

export const Departments = [
  { value: Department.Backend, label: 'Backend Developer' },
  { value: Department.Frontend, label: 'Frontend Developer' },
  { value: Department.QualityAssurance, label: 'Quality Assurance' },
  { value: Department.ProductManagement, label: 'Product Management' },
  { value: Department.ScrumMaster, label: 'Scrum Master' },
  { value: Department.DevOps, label: 'DevOps' },
  { value: Department.UIUXDesign, label: 'UI/UX Design' },
];
