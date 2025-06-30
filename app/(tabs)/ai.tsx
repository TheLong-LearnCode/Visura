import { Colors } from "@/utils/Colors";
import { getImageDimensions } from "@/utils/helper";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import moment from "moment";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";

export default function Index() {
  const [model, setModel] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("");
  const [imageURL, setImageURL] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");

  const examplePrompts = [
    "Mountain lake with snowy peaaks and misty pine trees",
    "Cyberpunk city at night with neon lights and flying cars",
    "Glowing forest with magical creatures under moonlight",
    "Baby fox curled in autumn leaves",
    "Artistic sushi plate with natural lighting",
    "Spaceship view of nebula and ringed planet",
    "Foggy medieval village with cobblestone streets",
    "Dark warrior in burning battlefield",
    "Floating islands with skyward waterfalls",
    "Scandinavian living room with cozy sunlight",
  ];

  const generatePrompt = () => {
    const prompt =
      examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    setPrompt(prompt);
  };

  const saveImageToHistory = async (imageUrl: string, prompt: string, model: string, aspectRatio: string) => {
    try {
      const newImage = {
        id: Date.now().toString(),
        imageUrl,
        prompt,
        model,
        aspectRatio,
        createdAt: moment().format(),
      };

      const existingImages = await AsyncStorage.getItem('generatedImages');
      const images = existingImages ? JSON.parse(existingImages) : [];
      images.unshift(newImage); // Add to beginning of array (newest first)

      await AsyncStorage.setItem('generatedImages', JSON.stringify(images));
    } catch (error) {
      console.error('Error saving image to history:', error);
    }
  };

  const generateImage = async () => {
    // Validation: Check if all required fields are filled
    if (!prompt.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing description',
        text2: 'Please enter a description for the image',
        visibilityTime: 3000,
      });
      return;
    }

    if (!model) {
      Toast.show({
        type: 'error',
        text1: 'Missing model',
        text2: 'Please select an AI model',
        visibilityTime: 3000,
      });
      return;
    }

    if (!aspectRatio) {
      Toast.show({
        type: 'error',
        text1: 'Missing aspect ratio',
        text2: 'Please select an aspect ratio',
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    setImageURL("");
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${model}`;
    const { width, height } = getImageDimensions(aspectRatio);
    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    try {
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: width,
            height: height,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      const fileReaderInstance = new FileReader();
      fileReaderInstance.readAsDataURL(blob);
      fileReaderInstance.onload = async () => {
        const base64data = fileReaderInstance.result;
        setImageURL(base64data);
        setIsLoading(false);

        // Save to history
        if (typeof base64data === 'string') {
          await saveImageToHistory(base64data, prompt, model, aspectRatio);
        }

        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Image generated successfully! ✨',
          text2: 'AI image has been generated',
          visibilityTime: 3000,
        });
      };
    } catch (error) {
      setIsLoading(false);
      console.error("Error generating image:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      Toast.show({
        type: 'error',
        text1: 'Image generation error',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

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

  const handleDownLoad = async () => {
    if (!imageURL) {
      Toast.show({
        type: 'error',
        text1: 'No image',
        text2: 'No image to download',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      let base64Code: string;
      let fileExtension = "jpeg";

      if (typeof imageURL === "string") {
        // Check for different data URL formats
        if (imageURL.startsWith("data:image/jpeg;base64,")) {
          base64Code = imageURL.split("data:image/jpeg;base64,")[1];
          fileExtension = "jpeg";
        } else if (imageURL.startsWith("data:image/png;base64,")) {
          base64Code = imageURL.split("data:image/png;base64,")[1];
          fileExtension = "png";
        } else if (imageURL.startsWith("data:image/webp;base64,")) {
          base64Code = imageURL.split("data:image/webp;base64,")[1];
          fileExtension = "webp";
        } else if (imageURL.includes("base64,")) {
          // Generic base64 data URL
          base64Code = imageURL.split("base64,")[1];
          fileExtension = "jpeg"; // Default to jpeg
        } else {
          throw new Error("Unsupported image format or invalid data URL");
        }
      } else {
        throw new Error("Invalid image URL format");
      }

      if (!base64Code || base64Code.trim() === "") {
        throw new Error("Failed to extract base64 data from image");
      }

      const date = moment().format("YYYY-MM-DD_HH-mm-ss");
      const filename = FileSystem.documentDirectory + `visura_image_${date}.${fileExtension}`;

      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(filename);
      Toast.show({
        type: 'success',
        text1: 'Download successful! 🎉',
        text2: 'Image has been saved to the library',
        visibilityTime: 4000,
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      Toast.show({
        type: 'error',
        text1: 'Download error',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  const handleShare = async () => {
    if (!imageURL) {
      Toast.show({
        type: 'error',
        text1: 'No image',
        text2: 'No image to share',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      let base64Code: string;
      let fileExtension = "jpeg";

      if (typeof imageURL === "string") {
        // Check for different data URL formats
        if (imageURL.startsWith("data:image/jpeg;base64,")) {
          base64Code = imageURL.split("data:image/jpeg;base64,")[1];
          fileExtension = "jpeg";
        } else if (imageURL.startsWith("data:image/png;base64,")) {
          base64Code = imageURL.split("data:image/png;base64,")[1];
          fileExtension = "png";
        } else if (imageURL.startsWith("data:image/webp;base64,")) {
          base64Code = imageURL.split("data:image/webp;base64,")[1];
          fileExtension = "webp";
        } else if (imageURL.includes("base64,")) {
          // Generic base64 data URL
          base64Code = imageURL.split("base64,")[1];
          fileExtension = "jpeg"; // Default to jpeg
        } else {
          throw new Error("Unsupported image format or invalid data URL");
        }
      } else {
        throw new Error("Invalid image URL format");
      }

      if (!base64Code || base64Code.trim() === "") {
        throw new Error("Failed to extract base64 data from image");
      }

      const date = moment().format("YYYY-MM-DD_HH-mm-ss");
      const filename = FileSystem.documentDirectory + `visura_share_${date}.${fileExtension}`;

      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Toast.show({
          type: 'error',
          text1: 'Sharing not supported',
          text2: 'Device does not support sharing',
          visibilityTime: 3000,
        });
        return;
      }

      await Sharing.shareAsync(filename, {
        mimeType: `image/${fileExtension}`,
        dialogTitle: 'Share AI image from Visura',
      });

      Toast.show({
        type: 'success',
        text1: 'Sharing successful! 📤',
        text2: 'Select an application to share the image',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Error sharing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      Toast.show({
        type: 'error',
        text1: 'Sharing error',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  return (
    <>
      <Stack.Screen />

      <View style={styles.container}>
        <Text style={styles.title}>Visura</Text>
        <View style={{ height: 130 }}>
          <TextInput
            placeholder="Describe your idea here...."
            placeholderTextColor={Colors.gray}
            style={styles.inputContainer}
            numberOfLines={3}
            multiline={true}
            textAlignVertical="top"
            value={prompt}
            onChangeText={(text) => setPrompt(text)}
          />

          <LinearGradient
            colors={[Colors.green, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.randomBtn}
          >
            <TouchableOpacity onPress={() => generatePrompt()}>
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
          placeholder="Select Model"
          value={model}
          onChange={(item) => {
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
          placeholder="Aspect Ratio"
          value={aspectRatio}
          onChange={(item) => {
            setAspectRatio(item.value);
          }}
        />
        <TouchableOpacity onPress={() => generateImage()}>
          <LinearGradient
            colors={[Colors.green, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGen}
          >
            <Text style={styles.buttonText}>Generate</Text>
          </LinearGradient>
        </TouchableOpacity>

        {isLoading && (
          <View
            style={[
              styles.imageContainer,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <ActivityIndicator size="large" color={Colors.purple} />
          </View>
        )}

        {imageURL && (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageURL }} style={styles.image} />
            </View>

            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => handleDownLoad()}
              >
                <FontAwesome5
                  name="download"
                  size={20}
                  style={{ color: Colors.white }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => handleShare()}
              >
                <FontAwesome5
                  name="share"
                  size={20}
                  style={{ color: Colors.white }}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Toast component - REQUIRED for displaying toasts */}
      <Toast />
    </>
  );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1,
    marginTop: 20,
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
    height: 130,
  },
  randomBtn: {
    padding: 10,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    position: "relative",
    bottom: 50,
    right: 10,
  },
  dropdown: {
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
  buttonGen: {
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
  },
  imageContainer: {
    height: 250,
    width: windowWidth - 40,
    marginTop: 20,
    borderRadius: 10,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  image: {
    width: "100%",
    borderRadius: 10,
    height: "100%",
    resizeMode: "contain",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  downloadBtn: {
    height: 50,
    width: 50,
    backgroundColor: Colors.purple,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});
