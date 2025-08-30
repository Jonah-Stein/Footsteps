export interface footstep {
    id?: number;
    timestamp: number;
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