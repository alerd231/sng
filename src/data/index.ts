import competenciesJson from './competencies.json'
import documentsJson from './documents.json'
import experienceJson from './experience.json'
import partnersJson from './partners.json'
import projectsJson from './projects.json'
import siteSettingsJson from './siteSettings.json'
import vacanciesJson from './vacancies.json'
import type {
  CareersPageSettings,
  Competency,
  DocumentItem,
  ExperienceItem,
  Partner,
  Project,
  SiteSettings,
  Vacancy,
} from '../types/models'

export const competencies = competenciesJson as Competency[]
export const documents = documentsJson as DocumentItem[]
export const experience = experienceJson as ExperienceItem[]
export const partners = partnersJson as Partner[]
export const projects = projectsJson as Project[]
export const vacancies = vacanciesJson as Vacancy[]
export const siteSettings = siteSettingsJson as SiteSettings
export const defaultCareersPageSettings = siteSettings.careers as CareersPageSettings
