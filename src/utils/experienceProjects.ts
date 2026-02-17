import type { ExperienceItem, Project } from '../types/models'

const DEFAULT_IMAGE = '/images/background-project.png'
const DEFAULT_CONTRACTOR = 'ООО «СтройНефтеГаз»'
const DEFAULT_INN = '1655282573'

const clean = (value: string) => value.replace(/\s+/g, ' ').trim()

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

const detectObjectType = (subject: string, work: string) => {
  const source = `${subject} ${work}`.toLowerCase()

  if (source.includes('грс')) return 'ГРС'
  if (source.includes('гис')) return 'ГИС'
  if (source.includes('м-7') || source.includes('автомобильной дороги')) {
    return 'Автодорога'
  }
  if (source.includes('нпс') || source.includes('лпдс') || source.includes('рну')) {
    return 'Нефтепроводная инфраструктура'
  }
  if (source.includes('кс')) return 'Компрессорная станция'
  if (source.includes('итсо') || source.includes('тсо') || source.includes('охраны')) {
    return 'ИТСО/ТСО'
  }

  return 'Промышленный объект'
}

const detectRegion = (subject: string) => {
  const text = subject.toLowerCase()

  if (text.includes('татарстан') || text.includes('казань') || text.includes('альметьев')) {
    return 'Республика Татарстан'
  }
  if (text.includes('чебоксар') || text.includes('чуваш')) return 'Чувашская Республика'
  if (text.includes('удмурт') || text.includes('увин')) return 'Удмуртская Республика'
  if (text.includes('перм') || text.includes('чайковск')) return 'Пермский край'
  if (text.includes('иванов')) return 'Ивановская область'
  if (text.includes('владимир')) return 'Владимирская область'
  if (text.includes('нижегород') || text.includes('нижний новгород')) {
    return 'Нижегородская область'
  }
  if (text.includes('марий')) return 'Республика Марий Эл'
  if (text.includes('башкир') || text.includes('салават') || text.includes('туймаз')) {
    return 'Республика Башкортостан'
  }
  if (text.includes('курган')) return 'Курганская область'

  return 'Регионы РФ'
}

const detectWorkTypes = (subject: string, work: string) => {
  const text = `${subject} ${work}`.toLowerCase()
  const workTypes: string[] = []

  if (text.includes('пнр') || text.includes('пуско')) workTypes.push('ПНР')
  if (
    text.includes('автомат') ||
    text.includes('асу') ||
    text.includes('кип') ||
    text.includes('телемехан')
  ) {
    workTypes.push('Автоматизация')
  }
  if (text.includes('шеф')) workTypes.push('Шеф-монтаж')
  if (text.includes('монтаж') || text.includes('строител')) workTypes.push('СМР')
  if (text.includes('итсо')) workTypes.push('ИТСО')
  if (text.includes('тсо') || text.includes('сигнализац')) workTypes.push('ТСО')

  if (!workTypes.length) {
    const firstSegment = clean(work.split(',')[0] || '')
    return [firstSegment || 'Комплекс работ']
  }

  return [...new Set(workTypes)]
}

const detectCompetencyIds = (subject: string, work: string): string[] => {
  const text = `${subject} ${work}`.toLowerCase()
  const competencyIds: string[] = []

  if (text.includes('шеф')) competencyIds.push('comp-supervision')
  if (text.includes('пнр') || text.includes('пуско')) competencyIds.push('comp-commissioning')
  if (
    text.includes('автомат') ||
    text.includes('асу') ||
    text.includes('кип') ||
    text.includes('телемехан')
  ) {
    competencyIds.push('comp-automation')
  }
  if (
    text.includes('итсо') ||
    text.includes('тсо') ||
    text.includes('сигнализац') ||
    text.includes('охраны')
  ) {
    competencyIds.push('comp-security')
  }
  if (text.includes('монтаж') || text.includes('строител')) competencyIds.push('comp-construction')

  if (!competencyIds.length) {
    competencyIds.push('comp-construction')
  }

  return [...new Set(competencyIds)]
}

const extractInn = (customer: string) => customer.match(/\b\d{10}\b/)?.[0] ?? DEFAULT_INN

const extractCustomerName = (customer: string) => clean(customer.split(',')[0] || customer)

const buildTitle = (subject: string) => truncate(clean(subject), 118)

const buildExcerpt = (work: string, customer: string) => {
  const workScope = clean(work || 'комплекс инженерных работ')
  const customerName = extractCustomerName(customer)

  return truncate(`Выполнены работы: ${workScope}. Заказчик: ${customerName}.`, 220)
}

const createProjectFromExperience = (row: ExperienceItem): Project => {
  const title = buildTitle(row.subject)
  const objectType = detectObjectType(row.subject, row.work)
  const workTypes = detectWorkTypes(row.subject, row.work)
  const region = detectRegion(row.subject)
  const customerName = extractCustomerName(row.customer)
  const inn = extractInn(row.customer)

  return {
    id: `exp-project-${row.id}`,
    slug: `experience-${row.id}`,
    year: row.year,
    title,
    shortTitle: workTypes.join(', '),
    excerpt: buildExcerpt(row.work, row.customer),
    heroImage: DEFAULT_IMAGE,
    gallery: [DEFAULT_IMAGE],
    region,
    objectType,
    workTypes,
    passport: {
      period: String(row.year),
      status: 'Завершен',
      customer: customerName,
      contractor: DEFAULT_CONTRACTOR,
      inn,
      location: title,
      objectType,
      workScope: row.work || 'Комплекс работ',
    },
    tasks: [
      'Выполнить строительно-монтажные и/или наладочные работы в согласованные сроки.',
      'Обеспечить соответствие работ техническим требованиям заказчика.',
      'Подготовить комплект исполнительной и отчетной документации.',
    ],
    solutions: [
      'Сформирован поэтапный план производства работ и технического контроля.',
      'Организована координация инженерных и производственных служб на площадке.',
      'Проведены необходимые испытания и верификация параметров.',
    ],
    results: [
      'Работы завершены и переданы заказчику в установленном порядке.',
      'Подтверждена работоспособность систем по итогам приемо-сдаточных процедур.',
      'Сформирован комплект материалов для тендерного и эксплуатационного архива.',
    ],
    files: [],
    relatedCompetencyIds: detectCompetencyIds(row.subject, row.work),
  }
}

export const extendProjectsWithExperience = (
  projects: Project[],
  experienceRows: ExperienceItem[],
) => {
  const generatedProjects = experienceRows.map(createProjectFromExperience)
  const existingIds = new Set(projects.map((item) => item.id))
  const existingSlugs = new Set(projects.map((item) => item.slug))
  const additions: Project[] = []

  for (const project of generatedProjects) {
    if (existingIds.has(project.id) || existingSlugs.has(project.slug)) {
      continue
    }

    existingIds.add(project.id)
    existingSlugs.add(project.slug)
    additions.push(project)
  }

  return [...projects, ...additions].sort((left, right) => right.year - left.year)
}
