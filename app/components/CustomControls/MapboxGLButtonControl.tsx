export default class MapboxGLButtonControl {
    private readonly _className: string
    private readonly _title: string
    private _eventHandler: () => void
    private _btn: HTMLButtonElement | undefined
    private _container: HTMLDivElement | undefined
    private lastUpdate: number = 0

    constructor({className = "", title = "", eventHandler = () => {}}) {
        this._className = className;
        this._title = title;
        this._eventHandler = eventHandler;
    }

    public shouldUpdate(): boolean {
        return new Date().getTime() - this.lastUpdate > 3000 // Every 3 seconds
    }

    public updateEventHandler(eventHandler: () => void) {
        this._eventHandler = eventHandler;
    }

    onAdd(_: any) {
        this._btn = document.createElement("button");
        this._btn.className = "mapboxgl-ctrl-icon" + " " + this._className;
        this._btn.type = "button";
        this._btn.title = this._title;
        this._btn.onclick = this._eventHandler;

        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
        this._container.appendChild(this._btn);

        return this._container;
    }

    onRemove() {
        this._container?.parentNode?.removeChild(this._container);
    }
}
