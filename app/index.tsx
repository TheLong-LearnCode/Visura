import { Colors } from "@/utils/Colors";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Visura",
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitleStyle: {
            color: Colors.text,
          },
        }}
      />

      <View style={styles.container}>
        <Text style={{ padding: 20, backgroundColor: Colors.black, color: Colors.text, borderRadius: 10 }}>
          Edit app/index.tsx to edit this screen.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
});
