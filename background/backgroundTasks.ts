import { BACKGROUND_LOCATION_TASK_NAME } from "@/constants";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";



TaskManager.defineTask(BACKGROUND_LOCATION_TASK_NAME, async({data , error}) => {
    if (error) {
        console.log("Error in background location task", error);
        return;
    }
    const {locations} = data as {locations: Location.LocationObject[]};
    console.log("locations: ", locations);
    if (locations.length === 0) return;
    
    // Need to redo this with drizzle
    
    // const dbConnection = await getDb();
    // const db = new FootstepsDb(dbConnection);
    // await db.insertTrackings(locations.map((location)=>({
    //     timestamp: location.timestamp,
    //     lat: location.coords.latitude,
    //     lon: location.coords.longitude
    // })));
});

export async function startBackgroundLocationTask() {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (foregroundStatus !== "granted" || backgroundStatus !== "granted") {
      console.log("Location permissions not granted");
    }

    const registered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    if (!registered){
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000,
            distanceInterval: 10,
            deferredUpdatesInterval: 1000 * 60 * 5,
            activityType: Location.ActivityType.Other,
        });
    }
}