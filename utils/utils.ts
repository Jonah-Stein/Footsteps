import { isPointWithinRadius } from "geolib";

export function in_location(lat: number, lon: number, location_lat: number, location_lon: number) {
    const radius = 0.00005;
    const is_in_location = isPointWithinRadius({
        latitude: lat,
        longitude: lon,
    }, {
        latitude: location_lat,
        longitude: location_lon,
    }, radius);
    return is_in_location;
}