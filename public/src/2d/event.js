export default class EventTarget{
	constructor() {
		this.listeners = new Map();
	}
	getHandler(name) {
		let listeners = this.listeners;
		let handlers = listeners.get(name);
		if(! handlers) listeners.set(name, handlers = []);
		return handlers;
	}
	on(name, handler) {
		let handlers = this.getHandler(name);
		handlers.push(handler);
	}
	off(name, handler) {
		let handlers = this.getHandler(name);
		let index = handlers.indexOf(handler);
		if(index >= 0) handlers.splice(index, 1);
	}
	invoke(name) {
		let handlers = this.getHandler(name);
		for(let handler of handlers) handler.call(this);
	}
}
//TODO: bubbling and propagation cancellation
