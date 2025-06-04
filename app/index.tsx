import { Colors } from "@/utils/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";

export default function Index() {
  const [model, setModel] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
    
  const modelData = [
  { label: "Flux.1-dev", value: "black-forest-labs/FLUX.1-dev" },
  { label: "Flux.1-schnell", value: "black-forest-labs/FLUX.1-schnell" },
  {
    label: "Stable Diffusion 3.5L",
    value: "stabilityai/stable-diffusion-3.5-large",
  },
  {
    label: "Stable Diffusion XL",
    value: "stabilityai/stable-diffusion-xl-base-1.0",
  },
  {
    label: "Stable Diffusion v1.5",
    value: "stable-diffusion-v1-5/stable-diffusion-v1-5",
  },
];

  const aspectRatioData = [
    { label: "1/1", value: "1/1" },
    { label: "16/9", value: "16/9" },
    { label: "9/16", value: "9/16" },
  ];


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
            numberOfLines={4}
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

         <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={modelData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder='Select Model'
          value={model}
          onChange={item => {
            setModel(item.value);
          }}
        />

        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={aspectRatioData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder='Aspect Ratio'
          value={aspectRatio}
          onChange={item => {
            setAspectRatio(item.value);
          }}
        />

        <LinearGradient
            colors={[Colors.green, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGen}
          >
            <TouchableOpacity onPress={() => console.log("Submit Idea")}>
              <Text style={styles.buttonText}>Generate</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  dropdown:{
    marginTop: 20,
    height: 50,
    backgroundColor: Colors.black,
    borderColor: Colors.white,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.gray,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.text,
  },
  buttonGen:{
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.2,
  }
});
