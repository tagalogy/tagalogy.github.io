export interface EventHandler {
    (this: EventTarget): void;
}
export class EventTarget {
    private handlers = new Map<string, EventHandler[]>();

    private getHandler(name: string): EventHandler[] {
        const listeners = this.handlers;
        let handlers = listeners.get(name);
        if (typeof handlers === "undefined")
            listeners.set(name, (handlers = []));
        return handlers;
    }
    on(name: string, handler: EventHandler): void {
        this.getHandler(name).push(handler);
    }
    once(name: string, handler?: EventHandler): Promise<void> {
        return new Promise(resolve => {
            const sub = () => {
                this.off(name, sub);
                if (handler) handler.call(this);
                resolve();
            };
            this.on(name, sub);
        });
    }
    off(name: string, handler: EventHandler): void {
        const handlers = this.getHandler(name);
        const index = handlers.indexOf(handler);
        if (index >= 0) handlers.splice(index, 1);
    }
    invoke(name: string): void {
        const handlers = this.getHandler(name);
        for (const handler of handlers) handler.call(this);
    }
}
