export default class Observer {
  constructor() {
	this.observers = [];
  }

  addObserver(observer) {
	this.observers.push(observer);
  }

  removeObserver(observer) {
	this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
	this.observers.forEach((observer) => {
	  observer.update(data);
	});
  }
}

