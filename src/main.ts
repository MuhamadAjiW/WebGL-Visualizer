import { MouseController } from "./controller/mouse-controller"
import { CanvasController } from './controller/canvas-controller';
import { UIController } from "./controller/ui-controller";

const glWin = new CanvasController("canvas");
const mouseCtrl = new MouseController(glWin);
const ui = new UIController(glWin, mouseCtrl);