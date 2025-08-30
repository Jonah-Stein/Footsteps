import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View>
        <Text>This is the not found screen</Text>
        <Link href={"/"}>Go to home screen</Link>
      </View>
    </>
  );
}
