type Class = new (...args: any[]) => any;

export class EventListener{
    protected observerMap: Map<Class, Observer<any>> = new Map<new (...args: any[]) => any, Observer<any>>;

    addObserver(classType: Class): void{
        if(this.observerMap.has(classType)) throw Error("Event listener already have an observer for that class");
        this.observerMap.set(classType, new Observer);
    }

    removeObserver(classType: Class): void{
        this.observerMap.delete(classType);
    }

    listen<T>(classType: Class, eventName: string, func: (data: T) => void): void{
        const observer = this.observerMap.get(classType);
        if(!observer) throw Error("Event listener does not have an observer for that class");
        observer.addEventListener(eventName, func);
    }

    unlisten(classType: Class, eventName: string): void{
        const observer = this.observerMap.get(classType);
        if(!observer) throw Error("Event listener does not have an observer for that class");
        observer.removeEventListener(eventName);
    }
    
    subscribe<T>(classType: Class, observable: IObservable<T>): void{
        const observer = this.observerMap.get(classType);
        if(!observer) throw Error("Event listener does not have an observer for that class");
        observer.subscribe(observable);
    }

    unsubscribe<T>(classType: Class, observable: IObservable<T>): void{
        const observer = this.observerMap.get(classType);
        if(!observer) throw Error("Event listener does not have an observer for that class");
        observer.unsubscribe(observable);
    }
}

export interface IObserver<T> {
    eventListeners: Map<string, (data: T) => void>;

    addEventListener(eventName: string, func: (data: T) => void): void;

    removeEventListener(eventName: string, func: (data: T) => void): void;

    subscribe(observer: IObservable<T>): void;

    unsubscribe(observer: IObservable<T>): void;
}

export interface IObservable<T> {
    subscribers: Array<IObserver<T>>;

    emit(string: string, data: T): void;

    addSubscriber(observer: IObserver<T>): void;

    removeSubscriber(observer: IObserver<T>): void;
}

export class Observer<T> implements IObserver<T> {
    eventListeners: Map<string, (data: T) => void>;

    constructor() {
        this.eventListeners = new Map<string, (data: T) => void>()
    }

    public addEventListener(eventName: string, func: (data: T) => void): void {
        this.eventListeners.set(eventName, func);
    }

    public removeEventListener(eventName: string): void {
        this.eventListeners.delete(eventName);
    }

    public subscribe(observer: IObservable<T>): void {
        observer.addSubscriber(this);
    };

    public unsubscribe(observer: IObservable<T>): void {
        observer.removeSubscriber(this);
    };
}

export class Observable<T> implements IObservable<T> {
    subscribers: Array<IObserver<T>>;

    constructor() {
        this.subscribers = [];
    }

    public emit(eventKey: string, data: T): void {
        this.subscribers.forEach((observer) => {
            const handler = observer.eventListeners.get(eventKey)
            if (handler) handler(data);
        })
    }

    public addSubscriber(observer: IObserver<T>): void {
        this.subscribers.push(observer);
    }

    public removeSubscriber(observer: IObserver<T>): void {
        delete this.subscribers[this.subscribers.indexOf(observer)]
    }
}