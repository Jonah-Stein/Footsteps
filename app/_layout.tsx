import { startBackgroundLocationTask } from "@/background/backgroundTasks";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import migrations from "../drizzle/migrations";

const expoDb = openDatabaseSync("db.db");

const db = drizzle(expoDb);

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  if (success) {
    console.log("Migration successful");
  }
  if (error) {
    console.error("Migration error", error.message);
  }

  useDrizzleStudio(expoDb);

  useEffect(() => {
    async () => {
      try {
        await startBackgroundLocationTask();
      } catch (error) {
        console.error("Error starting background location task", error);
      }
    };
  });

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
