import competenciesJson from './competencies.json'
import documentsJson from './documents.json'
import projectsJson from './projects.json'
import vacanciesJson from './vacancies.json'
import type { Competency, DocumentItem, Project, Vacancy } from '../types/models'

export const competencies = competenciesJson as Competency[]
export const documents = documentsJson as DocumentItem[]
export const projects = projectsJson as Project[]
export const vacancies = vacanciesJson as Vacancy[]
