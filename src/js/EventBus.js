class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const listeners = this._listeners[event];
        if (listeners) {
            this._listeners[event] = listeners.filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        const listeners = this._listeners[event];
        if (listeners) {
            listeners.forEach(cb => cb(data));
        }
    }
}

export const eventBus = new EventBus();
