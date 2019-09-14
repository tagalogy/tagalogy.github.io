import EventTarget from "./event.js";
import {
    now
} from "./2d/easing.js";
export default class GameState extends EventTarget{
    constructor(option = {}) {
        super(option);
        this.stopped = false;
        this.paused = false;
        this.startTime = now();
        this.pauseStartTime = NaN;
        this.pauseTime = 0;
        this.timeWhenPaused = 0;
    }
    get time() {
        if(this.paused) return this.timeWhenPaused;
        return now() - this.startTime - this.pauseTime;
    }
    pause() {
        if(this.paused) return;
        this.timeWhenPaused = this.time;
        this.pauseStartTime = now();
        this.paused = true;
        this.invoke("pause");
    }
    play() {
        if(this.stopped || ! this.paused) return;
        this.pauseTime += now() - this.pauseStartTime;
        this.paused = false;
        this.invoke("play");
    }
    toggle() {
        if(this.paused) {
            this.play();
        }else{
            this.pause();
        }
    }
    stop() {
        this.pause();
        this.stopped = true;
        this.invoke("stop");
    }
    timeout(time) {
        return new Promise((resolve, reject) => {
            let id = -1;
            let timeStart = this.time;
            let timeLeft = time;
            let onplay = () => {
                id = setTimeout(() => {
                    this.off("play", onplay);
                    this.off("pause", onpause);
                    resolve();
                }, timeLeft);
            };
            let onpause = () => {
                timeLeft -= this.time - timeStart;
                timeStart = this.time;
                clearTimeout(id);
            };
            if(! this.paused()) onplay();
            this.on("play", onplay);
            this.on("pause", onpause);
            this.once("stop", () => {
                reject();
            });
        });
    }
}
