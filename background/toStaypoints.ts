import { DB_PATH, MAX_STAYPOINT_INACTIVE_INTERVAL } from "@/constants";
import * as schema from "@/db/schema";
import { locations, staypoints, trackings } from "@/db/schema";
import { in_location } from "@/utils/utils";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync(DB_PATH);
const db = drizzle(expoDb, {schema});

// TODO: NOT REALLY RELEVANT HERE, BUT SHOULD BE ABLE TO CLEAR STAYPOINTS FROM
// A LONG TIME AGO
export async function convertTrackingsToStaypoints() {
  // Lets do some chunking -- this is pretty easy
  const chunkSize = 1000;

  console.log("Converting trackings to staypoints");

  let mostRecentStaypoint= await db.query.staypoints.findFirst({
    orderBy: [desc(schema.staypoints.end_time)],
    with: {
      location: true,
    }
  });
  let currentStaypoint= null;

  // Keep iterating through trackings until none left
  while (true) {
    const tracking_points = await db.select().from(trackings).orderBy(asc(trackings.timestamp)).limit(chunkSize);
    if (tracking_points.length == 0) break;
    
    // This is going to hold instructions for creating a new staypoint
    if (!mostRecentStaypoint){
      console.log("No recent staypoint, creating new one")
      currentStaypoint ={
        start_time: tracking_points[0].timestamp,
        end_time: tracking_points[0].timestamp,
        lat: tracking_points[0].lat,
        lon: tracking_points[0].lon,
        db_id: null
      }
    } else {
      currentStaypoint = {
        start_time: mostRecentStaypoint.start_time,
        end_time: mostRecentStaypoint.end_time,
        // TODO: better way to handle this
        lat: mostRecentStaypoint.location?.lat ?? 0,
        lon: mostRecentStaypoint.location?.lon ?? 0,
        db_id: mostRecentStaypoint.id
      }
    }
    
    // This could process the first tracking point twice, but not a big deal 
    for (const tracking of tracking_points) {
      const tooLongSinceRecentStaypoint = tracking.timestamp - currentStaypoint.end_time > MAX_STAYPOINT_INACTIVE_INTERVAL;
      const sameLocationAsRecentStaypoint = in_location(tracking.lat, tracking.lon, currentStaypoint.lat, currentStaypoint.lon)
      if (tooLongSinceRecentStaypoint || !sameLocationAsRecentStaypoint) {
        await uploadStaypoint(currentStaypoint);
        // Make a new staypoint
        currentStaypoint = {
          start_time: tracking.timestamp,
          end_time: tracking.timestamp,
          lat: tracking.lat,
          lon: tracking.lon,
          db_id: null
        }
      } else {
        // add on to existing staypoint
        currentStaypoint.end_time = tracking.timestamp;
      }
    }

    // Delete the trackings we processed
    await db.delete(trackings).where(inArray(trackings.id, tracking_points.map((t)=>t.id)))
  }
  // Upload the final staypoint
  await uploadStaypoint(currentStaypoint);

}

async function uploadStaypoint(staypoint: any) {
  console.log("Uploading staypoint")
  if (staypoint == null) return;
  // If id, then this is an existing staypoint
  if (staypoint.db_id) {
    return await db.update(staypoints).set({end_time: staypoint.end_time}).where(eq(staypoints.id, staypoint.db_id))
  }
  
  //TODO: get name from reverse geocoding
  const name = "placeholder"
  // TODO: add category id by seeding "auto-generated" at id=0
  const location = await db.insert(locations).values({lat: staypoint.lat, lon: staypoint.lon, name: name})
  const location_id = location.lastInsertRowId

  console.log("location_id: ", location_id);
  // Add staypoint linked to that location
  return await db.insert(staypoints).values({start_time: staypoint.start_time, end_time: staypoint.end_time, location_id: location_id});
}