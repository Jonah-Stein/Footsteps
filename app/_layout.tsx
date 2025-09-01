import { startBackgroundLocationTask } from "@/background/backgroundTasks";
import { convertTrackingsToStaypoints } from "@/background/toStaypoints";
import { DB_PATH } from "@/constants";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import migrations from "../drizzle/migrations";

const expoDb = openDatabaseSync(DB_PATH);

const db = drizzle(expoDb);

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const runningRef = useRef(false);
  useDrizzleStudio(expoDb);

  // Convert trackings to staypoints whenever app comes into foreground
  const runConvert = useCallback(async () => {
    console.log("running convert");
    if (runningRef.current) return; // skip if already running
    runningRef.current = true;
    try {
      await convertTrackingsToStaypoints();
    } catch (e) {
      console.error("convert failed", e);
    } finally {
      runningRef.current = false;
    }
  }, [convertTrackingsToStaypoints]);

  useEffect(() => {
    console.log("should run once");
    (async () => {
      await runConvert();
    })();

    const sub = AppState.addEventListener("change", async (next) => {
      const prev = appState.current;
      if ((prev === "background" || prev === "inactive") && next === "active") {
        await runConvert();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, []);

  if (success) {
    console.log("Migration successful");
  }
  if (error) {
    console.error("Migration error", error.message);
  }

  useEffect(() => {
    (async () => {
      try {
        console.log("Starting background location task");
        await startBackgroundLocationTask();
      } catch (error) {
        console.error("Error starting background location task", error);
      }
    })();
  }, []);

  return (
    <>
      <SQLiteProvider databaseName="footsteps">
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </SQLiteProvider>
    </>
  );
}
