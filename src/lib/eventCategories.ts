export interface CategoryDoc {
  id: number
  name: string
  group?: string | null
}

const LEGACY_CATEGORY_ALIASES: Record<string, string[]> = {
  technology: ['science-tech'],
  education: ['family-education'],
  business: ['business'],
  other: [],
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function findCategoryByValue(value: string, categories: CategoryDoc[]) {
  const normalizedValue = normalize(value)

  if (!normalizedValue) {
    return null
  }

  const directMatch = categories.find((category) => String(category.id) === value)

  if (directMatch) {
    return directMatch
  }

  const nameMatch = categories.find((category) => normalize(category.name) === normalizedValue)

  if (nameMatch) {
    return nameMatch
  }

  const groupMatch = categories.find((category) => normalize(category.group ?? '') === normalizedValue)

  if (groupMatch) {
    return groupMatch
  }

  const aliases = LEGACY_CATEGORY_ALIASES[normalizedValue] ?? []

  for (const alias of aliases) {
    const aliasMatch = categories.find((category) => normalize(category.group ?? '') === alias)

    if (aliasMatch) {
      return aliasMatch
    }
  }

  return null
}

export function resolveCategoryId(value: string, categories: CategoryDoc[]) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const numericValue = Number(trimmedValue)

  if (Number.isInteger(numericValue) && String(numericValue) === trimmedValue) {
    return numericValue
  }

  return findCategoryByValue(trimmedValue, categories)?.id ?? null
}

export function resolveCategoryValue(value: string, categories: CategoryDoc[]) {
  const categoryId = resolveCategoryId(value, categories)

  return categoryId ? String(categoryId) : ''
}
