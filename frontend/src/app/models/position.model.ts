export interface Position {
  id: string
  name: string
  description: string
  parentId?: string
  parentName?: string
  children?: Position[]
}

export interface CreatePositionDto {
  name: string
  description: string
  parentId?: string
}

export interface DeleteOptions {
  type: "simple" | "cascade" | "reassign"
  positionId: string
  positionName: string
  hasChildren: boolean
}
