import { DB_PATH } from "@/constants";
import * as schema from "@/db/schema";
import { staypointWithLocation } from "@/types/types";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const expoDb = openDatabaseSync(DB_PATH);
const db = drizzle(expoDb, { schema });

//TODO: need to add options to filter for staypoints within time range (notably days, week, etc.)
//Might want to make own dedicated stat page for this (could be user page)
export default function Map() {
  const [staypoints, setStaypoints] = useState<staypointWithLocation[]>([]);

  // Fetch staypoints from db
  useEffect(() => {
    const getStaypoints = async () => {
      //TODO: need to allow setting to query for staypoints within a certain time range
      const data = await db.query.staypoints.findMany({
        with: { location: true },
      });
      console.log("fetched the following data: ", data);
      const dataWithLocation = data
        .filter(
          (staypoint) =>
            staypoint.location?.lat != null && staypoint.location?.lon != null
        )
        .map((staypoint) => ({
          staypoint_id: staypoint.id,
          start_time: staypoint.start_time,
          end_time: staypoint.end_time,
          lat: staypoint.location?.lat ?? 0,
          lon: staypoint.location?.lon ?? 0,
          location_name: staypoint.location?.name ?? "N/a",
        }));
      setStaypoints(dataWithLocation);
    };
    getStaypoints();
  }, []);

  return (
    <View style={styles.container}>
      {/* Need to make these lats and longs dynamic */}
      {staypoints.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: staypoints[0].lat,
            longitude: staypoints[0].lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {staypoints?.map((staypoint) => (
            <Marker
              key={staypoint.staypoint_id}
              coordinate={{ latitude: staypoint.lat, longitude: staypoint.lon }}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.map}>
          <Text>Loading</Text>
        </View>
      )}
      <View style={styles.lowerContainer}>
        <Text>Container for stats</Text>
        <Text>{staypoints.length} staypoints</Text>
        {/* TODO: need to find the right stats to show */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: "100%",
    height: "50%",
  },

  lowerContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "red",
  },
});
