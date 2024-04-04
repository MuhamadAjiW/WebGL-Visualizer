import { BaseModel } from "../../models/base-model";
import { ModelType } from "../enum/model-state";

export class CanvasModelEvent {
    static EVENT_MODEL_ADD: string = "model_add";
    static EVENT_MODEL_UPDATE: string = "model_update";
    static EVENT_MODEL_DELETE: string = "model_delete";

    public modelBuffer: Map<string, BaseModel>;
    public model: BaseModel | null;
    public modelKey: string;
    public modelType: ModelType;

    constructor(modelFocusKey: Map<string, BaseModel>, model: BaseModel | null=null, modelKey: string="", modelType: ModelType) {
        this.modelBuffer = modelFocusKey;
        this.model = model;
        this.modelKey = modelKey;
        this.modelType = modelType;
    }
}