export interface EventListener<T> {
    eventListeners: Map<string, (data: T) => void>;
    addEventListener(eventName: string, func: (data: T) => void): void;
    removeEventListener(eventName: string, func: (data: T) => void): void;
    subscribe(observer: EventSource<T>): void;
    unsubscribe(observer: EventSource<T>): void;
}

export interface EventSource<T> {
    subscribers: Array<EventListener<T>>;
    emit(string: string, data: T): void;
    addSubscriber(observer: EventListener<T>): void;
    removeSubscriber(observer: EventListener<T>): void;
}

export class Observer<T> implements EventListener<T> {
    eventListeners: Map<string, (data: T) => void>;
    constructor(){
        this.eventListeners = new Map<string, (data: T) => void>()
    }
    public addEventListener(eventName: string, func: (data: T) => void): void {
        this.eventListeners.set(eventName, func);
    }
    public removeEventListener(eventName: string): void{
        this.eventListeners.delete(eventName);
    }
    public subscribe(observer: Observable<T>): void{
        observer.addSubscriber(this);
    };
    public unsubscribe(observer: Observable<T>): void{
        observer.removeSubscriber(this);
    };
}

export class Observable<T> implements EventSource<T> {
    subscribers: Array<EventListener<T>>;
    constructor(){
        this.subscribers = [];
    }

    public emit(eventKey: string, data: T): void{
        this.subscribers.forEach((observer) =>{
            const handler = observer.eventListeners.get(eventKey)
            if(handler) handler(data);
        })
    }
    public addSubscriber(observer: EventListener<T>): void{
        this.subscribers.push(observer);
    }
    public removeSubscriber(observer: EventListener<T>): void{
        delete this.subscribers[this.subscribers.indexOf(observer)]
    }
}