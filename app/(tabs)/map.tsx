import { footstep } from "@/types/types";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const [footsteps, setFootsteps] = useState<footstep[]>([]);
  const dbConnection = useSQLiteContext();
  // Need to redo this with drizzle
  // const db = new FootstepsDb(dbConnection);

  const seedFootsteps: footstep[] = [
    {
      timestamp: 10000,
      lat: 37.775,
      lon: -122.4194,
    },
    {
      timestamp: 10020,
      lat: 37.778,
      lon: -122.4201,
    },
  ];

  // Fetch footsteps from db
  useEffect(() => {
    const getFootsteps = async () => {
      // Need to redo this with drizzle
      const data: footstep[] = [];
      // const data = await db.getFootsteps();
      // const dbCheck = await db.checkDb();
      setFootsteps(data);
    };
    getFootsteps();
  }, []);

  return (
    <View style={styles.container}>
      {/* Need to make these lats and longs dynamic */}
      {footsteps.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: footsteps[0].lat,
            longitude: footsteps[0].lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {footsteps?.map((footstep) => (
            <Marker
              key={footstep.id}
              coordinate={{ latitude: footstep.lat, longitude: footstep.lon }}
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
