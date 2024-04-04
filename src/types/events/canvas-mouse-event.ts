export class CanvasMouseEvent {
    static EVENT_FOCUS_CHANGE_MARKER: string = "focus_change_marker";
    static EVENT_FOCUS_CHANGE_MODEL: string = "focus_change_model";

    public modelFocusKey: string | undefined
    public markerFocusKey: string | undefined

    constructor(modelFocusKey: string | undefined = undefined, markerFocusKey: string | undefined = undefined) {
        this.modelFocusKey = modelFocusKey;
        this.markerFocusKey = markerFocusKey;
    }
}