export class Frame {
    playing = true;
    constructor(onframe: () => void) {
        const callback = () => {
            if (!this.playing) return;
            onframe();
            requestAnimationFrame(callback);
        }
        requestAnimationFrame(callback)
    }
    stop(): void {
        this.playing = false;
    }
}