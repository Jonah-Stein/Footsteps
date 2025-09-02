import { DB_PATH } from "@/constants";
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserScreen() {
  const [totalStaypoints, setTotalStaypoints] = useState(0);
  const [uniqueLocations, setUniqueLocations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserStats = async () => {
      try {
        const expoDb = openDatabaseSync(DB_PATH);
        const db = drizzle(expoDb, { schema });
        const staypoints = await db.query.staypoints.findMany({
          with: { location: true },
        });
        
        setTotalStaypoints(staypoints.length);
        const locations = staypoints
          .filter(sp => sp.location?.name)
          .map(sp => sp.location?.name);
        setUniqueLocations(new Set(locations).size);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserStats();
  }, []);

  const StatCard = ({ icon, title, value, subtitle }: {
    icon: string;
    title: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={32} color="#ffd33d" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle" size={80} color="#ffd33d" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#ffd33d" />
        </View>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitleText}>Here's your location activity</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="location"
            title="Total Visits"
            value={totalStaypoints}
            subtitle="locations recorded"
          />
          <StatCard
            icon="business"
            title="Unique Places"
            value={uniqueLocations}
            subtitle="different locations"
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="map" size={24} color="#25292e" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>View Map</Text>
            <Text style={styles.actionSubtitle}>See all your locations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="analytics" size={24} color="#25292e" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Activity Report</Text>
            <Text style={styles.actionSubtitle}>Detailed insights</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings" size={24} color="#25292e" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>Privacy & preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  contentContainer: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },

  profileSection: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  avatarContainer: {
    marginBottom: 16,
  },

  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#25292e",
    marginBottom: 4,
  },

  subtitleText: {
    fontSize: 16,
    color: "#666",
  },

  statsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#25292e",
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    alignItems: "center",
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginHorizontal: 4,
  },

  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#25292e",
    marginTop: 8,
  },

  statTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginTop: 4,
  },

  statSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
    textAlign: "center",
  },

  actionsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#25292e",
  },

  actionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});
