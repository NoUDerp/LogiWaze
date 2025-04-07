export default class CooperativeDelay {
    startTime: number;
    maxRunTime: number;

    constructor(maxRunTime: number = 3) {
        this.startTime = Date.now();
        this.maxRunTime = maxRunTime;
    }

    public cooperate(): Promise<void> {
        if (Date.now() - this.startTime > this.maxRunTime)
            return new Promise<void>(resolve => setTimeout(() => {
                this.startTime = Date.now();
                resolve();
            }));
        else
            return new Promise<void>(resolve => resolve());
    }
}