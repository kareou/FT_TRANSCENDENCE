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


  notify(event, data = null) {
      this.observers.forEach((observer) => {
        if (observer.event === event) {
          observer.update(data);
        }
      }
    );
  }
}

