import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { PageLoader } from '../components/layout/PageLoader'

const HomePage = lazy(async () => ({ default: (await import('../pages/HomePage')).HomePage }))
const AboutPage = lazy(async () => ({ default: (await import('../pages/AboutPage')).AboutPage }))
const CompetenciesPage = lazy(async () => ({ default: (await import('../pages/CompetenciesPage')).CompetenciesPage }))
const ProjectsPage = lazy(async () => ({ default: (await import('../pages/ProjectsPage')).ProjectsPage }))
const ProjectDetailPage = lazy(async () => ({ default: (await import('../pages/ProjectDetailPage')).ProjectDetailPage }))
const DocumentsPage = lazy(async () => ({ default: (await import('../pages/DocumentsPage')).DocumentsPage }))
const CareersPage = lazy(async () => ({ default: (await import('../pages/CareersPage')).CareersPage }))
const CareerDetailPage = lazy(async () => ({ default: (await import('../pages/CareerDetailPage')).CareerDetailPage }))
const ContactsPage = lazy(async () => ({ default: (await import('../pages/ContactsPage')).ContactsPage }))
const PolicyPage = lazy(async () => ({ default: (await import('../pages/PolicyPage')).PolicyPage }))
const ConsentPage = lazy(async () => ({ default: (await import('../pages/ConsentPage')).ConsentPage }))
const NotFoundPage = lazy(async () => ({ default: (await import('../pages/NotFoundPage')).NotFoundPage }))

const withLoader = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    {element}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withLoader(<HomePage />) },
      { path: 'about', element: withLoader(<AboutPage />) },
      { path: 'competencies', element: withLoader(<CompetenciesPage />) },
      { path: 'projects', element: withLoader(<ProjectsPage />) },
      { path: 'projects/:slug', element: withLoader(<ProjectDetailPage />) },
      { path: 'documents', element: withLoader(<DocumentsPage />) },
      { path: 'careers', element: withLoader(<CareersPage />) },
      { path: 'careers/:slug', element: withLoader(<CareerDetailPage />) },
      { path: 'contacts', element: withLoader(<ContactsPage />) },
      { path: 'policy', element: withLoader(<PolicyPage />) },
      { path: 'consent', element: withLoader(<ConsentPage />) },
      { path: '404', element: withLoader(<NotFoundPage />) },
      { path: '*', element: withLoader(<NotFoundPage />) },
    ],
  },
])
