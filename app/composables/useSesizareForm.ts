import type { SesizareCard } from '@@/types/sesizare'
import type { SesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { StatusEnumSchema } from '@@/server/database/schema'
import { generateId } from '@@/utils/random'

export interface SesizareFormState extends Omit<SesizareFormSchema, 'media'> {
  media: string[]
  mediaFiles: File[]
}

const STORAGE_KEY = 'sesizare-draft'

const initialState: SesizareFormState = {
  id: generateId(25),
  title: '',
  description: '',
  latitude: null,
  longitude: null,
  media: [],
  mediaFiles: [],
  status: StatusEnumSchema.parse('new'),
  labels: [],
}

interface UploadResult {
  pathname: string
}

export function useSesizareForm() {
  const formState = ref<SesizareFormState>(initialState)
  const sesizariStore = useSesizariStore()
  const { user } = useUser()
  const upload = useUpload('/api/images/', { multiple: true, method: 'PUT' })

  // Load saved state on component mount
  onMounted(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        // Restore everything except mediaFiles since they can't be serialized
        formState.value = {
          ...parsed,
          mediaFiles: [],
          status: StatusEnumSchema.parse(parsed.status || 'new'),
        }
      }
      catch (error) {
        console.error('Failed to parse saved state:', error)
      }
    }
  })

  // Save state on changes
  watch(formState, (newState) => {
    const stateToSave = {
      ...newState,
      mediaFiles: [], // Don't save File objects
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }, { deep: true })

  const resetForm = () => {
    formState.value = { ...initialState }
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleMediaChange = (files: File[]) => {
    formState.value.mediaFiles = files
  }

  const handleSubmit = async () => {
    if (!user.value) {
      throw new Error('User must be logged in')
    }

    try {
      // Upload media files if any
      let mediaUrls: string[] = [...formState.value.media]
      if (formState.value.mediaFiles.length > 0) {
        const uploadResult = await upload(formState.value.mediaFiles)
        const uploadedUrls = Array.isArray(uploadResult)
          ? (uploadResult as UploadResult[]).map(r => r.pathname)
          : [(uploadResult as UploadResult).pathname]
        mediaUrls = [...mediaUrls, ...uploadedUrls]
      }

      // Create new sesizare
      const result = await sesizariStore.addSesizare({
        id: formState.value.id,
        title: formState.value.title,
        description: formState.value.description || null,
        latitude: formState.value.latitude || 0,
        longitude: formState.value.longitude || 0,
        status: StatusEnumSchema.parse(formState.value.status || 'new'),
        media: mediaUrls,
        labels: formState.value.labels || [],
        reporter: user.value.id,
        reporterName: user.value.fullName || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        votes: 1,
        voted: true,
      } satisfies SesizareCard)

      // Only clear the form if the submission was successful
      if (!(result instanceof Error)) {
        resetForm()
      }
    }
    catch (error) {
      console.error('Failed to submit sesizare:', error)
      throw error
    }
  }

  return {
    formState,
    resetForm,
    handleMediaChange,
    handleSubmit,
  }
}
