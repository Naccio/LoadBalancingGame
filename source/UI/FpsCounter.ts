class FpsCounter {
    private lastTimestamp = Date.now();
    private fps = 0;

    update() {
        const currentTimestamp = Date.now(),
            diff = (currentTimestamp - this.lastTimestamp) / 1000;

        this.fps = Math.floor(1 / diff);
        this.lastTimestamp = currentTimestamp;
    };

    logFps() {
        let l = document.getElementById('fps');
        if (!l) {
            const log = document.getElementById('log');

            if (log) {
                log.innerHTML = 'Fps: <span id="fps"></span><br />' + log.innerHTML;
            }
            l = document.getElementById('fps');
        }
        l!.innerHTML = this.fps.toString();
    };
}