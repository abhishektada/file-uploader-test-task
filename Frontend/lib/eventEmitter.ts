export const eventEmitter = {
  listeners: new Map(),

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  },

  emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback: Function) => callback(data));
    }
  },

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  },
};
