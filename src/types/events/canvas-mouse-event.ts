export class CanvasMouseEvent{
    static EVENT_FOCUS_CHANGE: string = "focuschange";

    public modelFocusKey: string | undefined
    public markerFocusKey: string | undefined

    constructor(modelFocusKey: string | undefined = undefined, markerFocusKey: string | undefined = undefined) {
        this.modelFocusKey = modelFocusKey;
        this.markerFocusKey = markerFocusKey;
    }
}