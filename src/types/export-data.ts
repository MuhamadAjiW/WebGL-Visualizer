import { BaseModel } from "../models/base-model"

export interface ExportData{
    modelMapKey: number
    modelBuffer: Array<[string, BaseModel]>
}