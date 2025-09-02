import { DB_PATH } from "@/constants";
import * as schema from "@/db/schema";
import { staypointWithLocation } from "@/types/types";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

type TimeFilter = 'day' | 'week' | 'month' | 'all';

export default function Map() {
  const [staypoints, setStaypoints] = useState<staypointWithLocation[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  // Fetch staypoints from db
  useEffect(() => {
    const getStaypoints = async () => {
      try {
        const expoDb = openDatabaseSync(DB_PATH);
        const db = drizzle(expoDb, { schema });
        const data = await db.query.staypoints.findMany({
          with: { location: true },
        });
        console.log("fetched the following data: ", data);
        const dataWithLocation = data
          .filter(
            (staypoint) =>
              staypoint.location?.lat != null && staypoint.location?.lon != null
          )
          .filter((staypoint) => {
            if (timeFilter === 'all') return true;
            
            const now = new Date();
            const startTime = new Date(staypoint.start_time);
            const diffTime = now.getTime() - startTime.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            
            switch (timeFilter) {
              case 'day':
                return diffDays <= 1;
              case 'week':
                return diffDays <= 7;
              case 'month':
                return diffDays <= 30;
              default:
                return true;
            }
          })
          .map((staypoint) => ({
            staypoint_id: staypoint.id,
            start_time: staypoint.start_time,
            end_time: staypoint.end_time,
            lat: staypoint.location?.lat ?? 0,
            lon: staypoint.location?.lon ?? 0,
            location_name: staypoint.location?.name ?? "N/a",
          }));
        setStaypoints(dataWithLocation);
      } catch (error) {
        console.error("Error fetching staypoints:", error);
      }
    };
    getStaypoints();
  }, [timeFilter]);

  return (
    <View style={styles.container}>
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
              pinColor="#ffd33d"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Loading your locations...</Text>
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Ionicons name="analytics" size={24} color="#ffd33d" />
          <Text style={styles.statsTitle}>Your Activity</Text>
        </View>
        
        <View style={styles.filterContainer}>
          {(['day', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                timeFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                timeFilter === filter && styles.filterTextActive
              ]}>
                {filter === 'day' ? 'Today' : 
                 filter === 'week' ? 'Week' :
                 filter === 'month' ? 'Month' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{staypoints.length}</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {staypoints.length > 0 ? new Set(staypoints.map(sp => sp.location_name)).size : 0}
            </Text>
            <Text style={styles.statLabel}>Unique Places</Text>
          </View>
        </View>
        
        {staypoints.length > 0 && (
          <View style={styles.recentActivity}>
            <Text style={styles.recentTitle}>Recent Visits</Text>
            {staypoints.slice(0, 3).map((staypoint) => (
              <View key={staypoint.staypoint_id} style={styles.activityItem}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.activityText} numberOfLines={1}>
                  {staypoint.location_name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  map: {
    width: "100%",
    height: "60%",
  },

  loadingContainer: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },

  statsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#25292e",
    marginLeft: 8,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#25292e",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },

  recentActivity: {
    marginTop: 8,
  },

  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#25292e",
    marginBottom: 12,
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 6,
  },

  activityText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  filterButtonActive: {
    backgroundColor: "#ffd33d",
  },

  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },

  filterTextActive: {
    color: "#000",
    fontWeight: "600",
  },
});
