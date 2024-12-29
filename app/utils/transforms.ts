import type { SesizareCard } from '@@/types/sesizare'
import type { SesizareFormSchema } from '@@/utils/forms/sesizareSchema'

/**
 * Transforms a SesizareCard (database type) to SesizareFormSchema (form type)
 */
export function toFormSchema(sesizare: SesizareCard): SesizareFormSchema {
  return {
    id: sesizare.id,
    title: sesizare.title,
    description: sesizare.description || undefined,
    latitude: sesizare.latitude || null,
    longitude: sesizare.longitude || null,
    status: sesizare.status,
    media: sesizare.media ? [...sesizare.media] : undefined,
    labels: sesizare.labels,
  }
}

/**
 * Transforms a SesizareFormSchema (form type) to SesizareCard (database type)
 */
export function toCardSchema(formData: SesizareFormSchema, existingSesizare: SesizareCard): SesizareCard {
  return {
    id: formData.id,
    title: formData.title,
    description: formData.description === undefined ? null : formData.description,
    latitude: formData.latitude || 0,
    longitude: formData.longitude || 0,
    status: formData.status || existingSesizare.status,
    media: formData.media?.filter((item: string | File): item is string => typeof item === 'string') || null,
    labels: formData.labels || [],
    reporter: existingSesizare.reporter,
    reporterName: existingSesizare.reporterName,
    createdAt: existingSesizare.createdAt,
    updatedAt: new Date(),
    votes: existingSesizare.votes,
    voted: existingSesizare.voted,
  }
}
