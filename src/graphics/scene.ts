import { Object2d, Object2dOption } from "./object_2d";
import { Frame } from "./frame";

export interface SceneOption extends Object2dOption {
    autoresize?: boolean;
    canvas: HTMLCanvasElement;
    alpha?: boolean;
    scale?: number;
}
export class Scene extends Object2d {
    scale: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    frame: Frame;
    constructor(option: SceneOption) {
        super(option);
        this.scene = this;
        const scale = (this.scale = option.scale ?? 1);
        const canvas = (this.canvas = option.canvas);
        if (option.autoresize) {
            this.updateBound = function () {
                this.x = 0;
                this.y = 0;
                this.width = canvas.clientWidth * scale;
                this.height = canvas.clientHeight * scale;
            };
        }
        const context = canvas.getContext("2d", {
            alpha: option.alpha ?? true,
        });
        if (!context)
            throw new Error("canvas rendering context not supporteed");
        this.context = context;
        context.imageSmoothingEnabled = true;
        this.frame = new Frame(() => {
            this.draw(this.context);
            this.invoke("frame");
        });
        const mouseEventNames = [
            "click",
            "mouseup",
            "mousedown",
            "mousemove",
        ] as const;
        const touchEventNames = ["touchstart", "touchend"] as const;
        for (const eventName of mouseEventNames) {
            canvas.addEventListener(eventName, event => {
                event.preventDefault();
                const { pageX: x, pageY: y } = event;
                this.forEachDescendant(descendant => {
                    if (descendant.hitTest(x * scale, y * scale)) {
                        descendant.invoke(eventName);
                        if (eventName === "mousedown")
                            descendant.invoke("interactdown");
                        if (eventName === "mouseup")
                            descendant.invoke("interactup");
                    }
                });
            });
        }
        canvas.addEventListener("touchmove", event => {
            event.preventDefault();
        });
        for (const eventName of touchEventNames) {
            canvas.addEventListener(eventName, event => {
                event.preventDefault();
                const touches = Array.from(event.changedTouches);
                this.forEachDescendant(descendant => {
                    if (
                        touches.some(touch =>
                            descendant.hitTest(
                                touch.pageX * scale,
                                touch.pageY * scale,
                            ),
                        )
                    ) {
                        if (eventName === "touchstart")
                            descendant.invoke("interactdown");
                        if (eventName === "touchend")
                            descendant.invoke("interactup");
                    }
                });
            });
        }
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateBound();
        const { canvas, width, height } = this;
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        if (drawChildren) this.drawChildren(context);
    }
}
