export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface Competency {
  id: string
  title: string
  summary: string
  group: 'construction' | 'commissioning' | 'automation' | 'security'
  services: string[]
}

export interface ProjectFile {
  name: string
  type: string
  size: string
  url: string
}

export interface ProjectPassport {
  period: string
  status: string
  customer: string
  contractor: string
  inn: string
  location: string
  objectType: string
  workScope: string
}

export interface Project {
  id: string
  slug: string
  year: number
  title: string
  shortTitle: string
  excerpt: string
  heroImage: string
  gallery: string[]
  region: string
  objectType: string
  workTypes: string[]
  passport: ProjectPassport
  tasks: string[]
  solutions: string[]
  results: string[]
  files: ProjectFile[]
  relatedCompetencyIds: string[]
}

export type DocumentCategory =
  | 'Учредительные'
  | 'СРО и лицензии'
  | 'Политики и регламенты'
  | 'Сертификаты'
  | 'Презентационные материалы'

export interface DocumentItem {
  id: string
  title: string
  date: string
  type: string
  size: string
  category: DocumentCategory
  url: string
}

export type VacancyFormat = 'office' | 'hybrid' | 'remote'
export type VacancyEmployment = 'full' | 'part' | 'rotation'
export type VacancyExperience = '0' | '1-3' | '3-6' | '6+'

export interface Vacancy {
  id: string
  slug: string
  title: string
  city: string
  format: VacancyFormat
  dept: string
  employment: VacancyEmployment
  experience: VacancyExperience
  salaryFrom: number
  salaryTo: number
  currency: 'RUB'
  postedAt: string
  priority: boolean
  keywords: string[]
  summary: string
  responsibilities: string[]
  requirements: string[]
  conditions: string[]
}

export type VacancySort = 'date_desc' | 'salary_desc' | 'priority'
