import mapboxgl from "mapbox-gl";
import {DroneStatus} from "@interfaces/DroneStatus";

export class DroneStatusControl {
    // private map: mapboxgl.Map | undefined;
    private container: HTMLElement | undefined;
    private droneStatus: DroneStatus | undefined;

    public setDroneStatus(droneStatus: DroneStatus) {
        this.droneStatus = droneStatus
    }

    onAdd(_: mapboxgl.Map){
        // this.map = map;

        this.container = document.createElement('div');

        if (!this.droneStatus) return this.container

        this.container.className = 'droneStatusControl';

        this.container.textContent = `
            Elevation: ${this.droneStatus.altitude?.toFixed(1)}m
            Speed: ${Math.sqrt((this.droneStatus.vx ?? 0)**2 + (this.droneStatus.vy ?? 0)**2).toFixed(1)}m/s
        `;

        return this.container
    }
    onRemove(){
        this.container?.parentNode?.removeChild(this.container);
        // this.map = undefined;
    }
}
