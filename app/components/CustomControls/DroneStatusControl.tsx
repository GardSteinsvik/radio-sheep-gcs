import mapboxgl from "mapbox-gl";
import {DroneStatus} from "@interfaces/DroneStatus";
import {GpsFixType} from '@/api/enums/gps-fix-type'

function getGpsFixTypeDescription(fixType: GpsFixType | undefined): string {
    switch (fixType) {
        case GpsFixType.GPS_FIX_TYPE_NO_GPS:
            return 'No GPS connected';
        case GpsFixType.GPS_FIX_TYPE_NO_FIX:
            return 'No position information, GPS is connected';
        case GpsFixType.GPS_FIX_TYPE_2D_FIX:
            return '2D position';
        case GpsFixType.GPS_FIX_TYPE_3D_FIX:
            return '3D position';
        case GpsFixType.GPS_FIX_TYPE_DGPS:
            return 'DGPS/SBAS aided 3D position';
        case GpsFixType.GPS_FIX_TYPE_RTK_FLOAT:
            return 'RTK float, 3D position';
        case GpsFixType.GPS_FIX_TYPE_RTK_FIXED:
            return 'RTK Fixed, 3D position';
        case GpsFixType.GPS_FIX_TYPE_STATIC:
            return 'Static fixed, typically used for base stations';
        case GpsFixType.GPS_FIX_TYPE_PPP:
            return 'PPP, 3D position.';
        case GpsFixType.GPS_FIX_TYPE_ENUM_END:
        default:
            return '-';
    }
}

export class DroneStatusControl {
    private container: HTMLElement | undefined;
    private droneStatus: DroneStatus | undefined;
    private lastUpdate: number = 0

    public shouldUpdate(): boolean {
        return new Date().getTime() - this.lastUpdate > 3000 // Every 3 seconds
    }

    public update(droneStatus: DroneStatus) {
        this.lastUpdate = new Date().getTime()
        this.droneStatus = droneStatus
    }

    onAdd(_: mapboxgl.Map){
        this.container = document.createElement('div');

        if (!this.droneStatus) return this.container

        this.container.className = 'droneStatusControl';

        this.container.innerHTML=`
            <strong>Drone Status</strong>
            <ul>
                <li>GPS Fix: ${getGpsFixTypeDescription(this.droneStatus.gpsFixType)}</li>
                <li>Number of GPS satellites: ${this.droneStatus.satellitesVisible ?? 0}</li>
                <li>Dilution of Position: H: ${this.droneStatus.gpsHDOP}, V: ${this.droneStatus.gpsVDOP}</li>
                <hr/>
                <li>Elevation: ${this.droneStatus.altitude?.toFixed(1) ?? 0}m</li>
                <li>Speed: ${Math.sqrt((this.droneStatus.vx ?? 0)**2 + (this.droneStatus.vy ?? 0)**2).toFixed(1)}m/s</li>
                <hr/>
                <li>Battery: ${this.droneStatus.battery}%</li>
                <li>Voltage: ${this.droneStatus.batteryVoltage}V</li>
            </ul>
        `

        return this.container
    }
    onRemove(){
        this.container?.parentNode?.removeChild(this.container);
    }
}
