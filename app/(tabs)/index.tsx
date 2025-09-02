import { DB_PATH } from "@/constants";
import * as schema from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const placeholderImage = require("../../assets/images/background-image.png");

export default function Index() {
  const [recentStaypoints, setRecentStaypoints] = useState<any[]>([]);
  const [totalStaypoints, setTotalStaypoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHomeData = async () => {
      try {
        const expoDb = openDatabaseSync(DB_PATH);
        const db = drizzle(expoDb, { schema });
        const staypoints = await db.query.staypoints.findMany({
          with: { location: true },
          orderBy: (staypoints, { desc }) => [desc(staypoints.start_time)],
        });

        setTotalStaypoints(staypoints.length);
        setRecentStaypoints(staypoints.slice(0, 3));
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    getHomeData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.headerSection}>
        <View style={styles.overlayContent}>
          <Text style={styles.welcomeTitle}>Footsteps</Text>
          <Text style={styles.welcomeSubtitle}>
            Track where you spend your time
          </Text>
        </View>
      </View>

      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStat}>
          <Ionicons name="location" size={24} color="#ffd33d" />
          <Text style={styles.quickStatNumber}>{totalStaypoints}</Text>
          <Text style={styles.quickStatLabel}>Total Visits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.quickStat}>
          <Ionicons name="time" size={24} color="#ffd33d" />
          <Text style={styles.quickStatNumber}>
            {loading ? "..." : "Today"}
          </Text>
          <Text style={styles.quickStatLabel}>Last Update</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="map" size={28} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Map</Text>
            <Text style={styles.actionSubtitle}>
              See all your visited locations
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View
            style={[styles.actionIconContainer, { backgroundColor: "#34c759" }]}
          >
            <Ionicons name="analytics" size={28} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Your Stats</Text>
            <Text style={styles.actionSubtitle}>
              View detailed activity insights
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {recentStaypoints.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentStaypoints.map((staypoint, index) => (
            <View key={staypoint.id || index} style={styles.recentItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.recentContent}>
                <Text style={styles.recentLocationName} numberOfLines={1}>
                  {staypoint.location?.name || "Unknown Location"}
                </Text>
                <Text style={styles.recentTime}>
                  {staypoint.start_time
                    ? new Date(staypoint.start_time).toLocaleDateString()
                    : "Recently"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  headerSection: {
    height: 200,
    position: "relative",
    backgroundColor: "#25292e",
  },

  imageContainer: {
    flex: 1,
    opacity: 0.6,
  },

  overlayContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(37, 41, 46, 0.3)",
  },

  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  quickStatsContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 20,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  quickStat: {
    flex: 1,
    alignItems: "center",
  },

  quickStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#25292e",
    marginTop: 8,
  },

  quickStatLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },

  actionsSection: {
    margin: 16,
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#25292e",
    marginBottom: 16,
  },

  actionCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ffd33d",
    justifyContent: "center",
    alignItems: "center",
  },

  actionContent: {
    flex: 1,
    marginLeft: 16,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#25292e",
    marginBottom: 2,
  },

  actionSubtitle: {
    fontSize: 14,
    color: "#666",
  },

  recentSection: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  recentContent: {
    flex: 1,
    marginLeft: 12,
  },

  recentLocationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#25292e",
    marginBottom: 2,
  },

  recentTime: {
    fontSize: 12,
    color: "#999",
  },
});
