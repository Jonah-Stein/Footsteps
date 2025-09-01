import { BACKGROUND_LOCATION_TASK_NAME } from "@/constants";
import { trackings } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Location from "expo-location";
import { openDatabaseSync } from "expo-sqlite";
import * as TaskManager from "expo-task-manager";



TaskManager.defineTask(BACKGROUND_LOCATION_TASK_NAME, async({data , error}) => {
    if (error) {
        console.log("Error in background location task", error);
        return;
    }
    const {locations} = data as {locations: Location.LocationObject[]};
    console.log("locations: ", locations);
    if (locations.length === 0) return;

    const expoDb = openDatabaseSync("db.db");
    const db = drizzle(expoDb)
    await db.insert(trackings).values(locations.map((trackingPoint)=>({
      timestamp: trackingPoint.timestamp,
      lat: trackingPoint.coords.latitude,
      lon: trackingPoint.coords.longitude,
    })));
});

export async function startBackgroundLocationTask() {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (foregroundStatus !== "granted" || backgroundStatus !== "granted") {
      console.log("Location permissions not granted");
    }
    console.log("we up and running");

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