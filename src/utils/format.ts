const ruDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  return ruDateFormatter.format(date)
}

const salaryFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

export const formatSalary = (from: number, to: number, currency = '₽'): string => {
  const left = salaryFormatter.format(from)
  const right = salaryFormatter.format(to)
  return `${left} - ${right} ${currency}`
}

export const formatVacancyFormat = (value: string): string => {
  const map: Record<string, string> = {
    office: 'Офис',
    hybrid: 'Гибрид',
    remote: 'Удаленно',
  }
  return map[value] ?? value
}

export const formatEmployment = (value: string): string => {
  const map: Record<string, string> = {
    full: 'Полная занятость',
    part: 'Частичная занятость',
    rotation: 'Вахтовый метод',
  }
  return map[value] ?? value
}

export const formatExperience = (value: string): string => {
  const map: Record<string, string> = {
    '0': 'Без опыта',
    '1-3': '1-3 года',
    '3-6': '3-6 лет',
    '6+': '6+ лет',
  }
  return map[value] ?? value
}
