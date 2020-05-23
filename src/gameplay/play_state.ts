import { EventTarget } from "../event/event";
import { now } from "../utils/time";

declare function setTimeout(callback: () => void, delay: number): number;
declare function clearTimeout(id: number): void;

export class PlayState extends EventTarget {
    stopped = false;
    paused = false;

    private startTime = now();
    private pauseStartTime = NaN;
    private pauseTime = 0;
    private timeWhenPaused = 0;

    get time(): number {
        if (this.paused) return this.timeWhenPaused;
        return now() - this.startTime - this.pauseTime;
    }
    pause(): void {
        if (this.paused) return;
        this.timeWhenPaused = this.time;
        this.pauseStartTime = now();
        this.paused = true;
        this.invoke("pause");
    }
    play(): void {
        if (this.stopped || !this.paused) return;
        this.pauseTime += now() - this.pauseStartTime;
        this.paused = false;
        this.invoke("play");
    }
    toggle(): void {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    }
    stop(): void {
        this.pause();
        this.stopped = true;
        this.invoke("stop");
    }
    timeout(time: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let id = -1;
            let timeStart = this.time;
            let timeLeft = time;
            const detach = () => {
                this.off("play", onplay);
                this.off("pause", onpause);
            };
            const onplay = () => {
                id = setTimeout(() => {
                    detach();
                    resolve();
                }, timeLeft);
            };
            const onpause = () => {
                timeLeft -= this.time - timeStart;
                timeStart = this.time;
                clearTimeout(id);
            };
            if (!this.paused) onplay();
            this.on("play", onplay);
            this.on("pause", onpause);
            this.once("stop", () => {
                detach();
                reject();
            });
        });
    }
}
