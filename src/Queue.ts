// //@ts-nocheck
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

    /**
     * Check if the queue is empty.
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    /**
     * Get the current size of the queue.
     */
    size(): number {
        return this.items.length;
    }

    /**
     * Get the number of pending dequeue operations.
     */
    pendingConsumers(): number {
        return this.waitingDequeues.length;
    }
}

// class queue {
//     constructor() { this._items = []; }
//     enqueue(item) { this._items.push(item); }
//     dequeue()     { return this._items.shift(); }
//     get size()    { return this._items.length; }
// }
//
// export default class Queue<T> extends queue{
//    
//    
//     constructor() {
//         super();
//         this._pendingPromise = false;
//     }
//
//     enqueue(action) {
//         return new Promise((resolve, reject) => {
//             super.enqueue({ action, resolve, reject });
//             this.dequeue();
//         });
//     }
//
//     async dequeue() {
//         if (this._pendingPromise) return false;
//
//         let item = super.dequeue();
//
//         if (!item) return false;
//
//         try {
//             this._pendingPromise = true;
//
//             let payload = await item.action(this);
//
//             this._pendingPromise = false;
//             item.resolve(payload);
//         } catch (e) {
//             this._pendingPromise = false;
//             item.reject(e);
//         } finally {
//             this.dequeue();
//         }
//
//         return true;
//     }
//
// //    
// //     #resolvers = new Array<{ (value: T | PromiseLike<T>): void }>();
// //     #promises = new Array<Promise<T>>();
// //
// //     #add(): void {
// //         if (!this.#resolvers.length) this.#promises.push(new Promise<T>(resolve => this.#resolvers.push(resolve)));
// //     }
// //
// //     enqueue(value: T): void {
// //         this.#add();
// //         const u = this.#resolvers.shift();
// //         if (u != null)
// //             u(value);
// //     }
// //
// //     dequeue(): Promise<T> {
// //         this.#add();
// //         return this.#promises.shift() as Promise<T>;
// //     }
// //
// // }
// //
// // export class Trigger {
// //
// //     #resolvers = new Array<{ (value: void | PromiseLike<void>): void }>();
// //     #promises = new Array<Promise<void>>();
// //
// //     #add(): void {
// //         if (!this.#resolvers.length) this.#promises.push(new Promise<void>(resolve => this.#resolvers.push(resolve)));
// //     }
// //
// //     enqueue(): void {
// //         this.#add();
// //         const u = this.#resolvers.shift();
// //         if (u != null)
// //             u();
// //     }
// //
// //     dequeue(): Promise<void> {
// //         this.#add();
// //         return this.#promises.shift() as Promise<void>;
// //     }
//
// }
