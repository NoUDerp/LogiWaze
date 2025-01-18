/**
 * Queue<T> implementation that acts like an async channel.
 * Supports enqueue and async dequeue operations.
 */
export default class Queue<T> {
    private items: T[] = [];
    private waitingDequeues: ((value: T) => void)[] = [];

    /**
     * Add an item to the queue.
     * If there are pending dequeue operations waiting, the item will be
     * immediately delivered to the oldest waiting consumer.
     */
    enqueue(item: T): void {
        // If there are waiting consumers, deliver the item immediately
        if (this.waitingDequeues.length > 0) {
            const resolve = this.waitingDequeues.shift()!;
            resolve(item);
        } else {
            // Otherwise, store the item in the queue
            this.items.push(item);
        }
    }

    /**
     * Dequeue an item from the queue.
     * Returns a promise that resolves when an item becomes available.
     */
    async dequeue(): Promise<T> {
        // If there are items in the queue, return the oldest one immediately
        if (this.items.length > 0) {
            return this.items.shift()!;
        }

        // Otherwise, return a promise that will resolve when an item is enqueued
        return new Promise<T>((resolve) => {
            this.waitingDequeues.push(resolve);
        });
    }
}