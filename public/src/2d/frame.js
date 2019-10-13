export default class Frame{
    constructor(onframe) {
        this.playing = true;
        let callback = () => {
            if(! this.playing) return;
            onframe();
            requestAnimationFrame(callback);
        } 
        requestAnimationFrame(callback)
    }
    stop() {
        this.playing = false;
    }
}