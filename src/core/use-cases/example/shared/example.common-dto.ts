// TODO: Expand this DTO to include all fields your API consumers need

export interface ExampleCommonDto {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ExampleEventPayload {
  id: string
  name: string
  active: boolean
  ip: string | undefined
  userId: string | undefined
}
