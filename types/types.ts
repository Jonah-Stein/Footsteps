export interface staypoint {
    id?: number;
    start_time: number;
    end_time: number;
    location_id: number;
}

export interface staypointWithLocation {
    staypoint_id: number;
    start_time: number;
    end_time: number;
    lat: number;
    lon: number;
    location_name: string;
}

export interface coordinates {
    lat: number;
    lon: number;
}

export interface location {
    id?: number;
    name: string;
    category_id?: string;
    lat: number;
    lon: number;
}

export interface category {
    id?: number;
    name: string;
    color: string;
}