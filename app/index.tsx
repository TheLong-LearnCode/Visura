import { Colors } from "@/utils/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

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
        <View style={{ height: 150 }}>
          <TextInput
            placeholder="Describe your idea here...."
            placeholderTextColor={Colors.gray}
            style={styles.inputContainer}
            numberOfLines={5}
            multiline={true}
            textAlignVertical="top"
          />

          <LinearGradient
            colors={[Colors.green, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.randomBtn}
          >
            <TouchableOpacity onPress={() => console.log("Submit Idea")}>
              <FontAwesome5 name="dice" size={20} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
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
  inputContainer: {
    backgroundColor: Colors.black,
    padding: 15,
    borderRadius: 10,
    borderColor: Colors.white,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: 500,
    color: Colors.text,
    letterSpacing: 0.2,
    height: 150,
  },
  randomBtn: {
    padding: 16,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    position: "relative",
    bottom: 60,
    right: 10,
  },
});
