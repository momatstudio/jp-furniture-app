import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";

const IMGBB_API_KEY = "beba90566c596ba94eda55b17c333ce8";

export const pickImage = async () => {
  try {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error("Permission denied: Cannot access media library");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (result.canceled) {
      throw new Error("Image selection cancelled");
    }

    if (!result.assets || !result.assets[0]) {
      throw new Error("No image selected");
    }

    return result.assets[0];
  } catch (error) {
    console.error("Image picker error:", error);
    throw new Error(error.message || "Failed to pick image");
  }
};

export const uploadToImgBB = async (base64Image) => {
  if (!base64Image) {
    throw new Error("No image data provided");
  }

  try {
    // Remove any existing data URI prefix and just send the base64 data
    const base64Data = base64Image.includes("base64,")
      ? base64Image.split("base64,")[1]
      : base64Image;

    const formData = new FormData();
    formData.append("image", base64Data);

    console.log("Uploading image...");

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        params: {
          key: IMGBB_API_KEY,
        },
        timeout: 15000,
      }
    );

    console.log("Raw response data:", response.data); // Debug log
    console.log("Image URL from response:", response.data.data.url); // Debug URL

    if (!response.data?.data?.url || !response.data?.data?.delete_url) {
      console.error("Invalid response:", response.data);
      throw new Error("Invalid response from image server");
    }

    // Extract the image ID and URL from the response
    const imageId = response.data.data.id;
    const deleteUrl = response.data.data.delete_url;

    const result = {
      url: response.data.data.display_url,
      imageId,
      deleteUrl,
    };

    console.log("Image upload successful:", result);
    return result;
  } catch (error) {
    console.error("Upload error details:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Upload timeout - Please try again");
      }
      if (error.response) {
        console.error("Server error details:", error.response.data);
        throw new Error(
          `Upload failed: ${
            error.response.data?.error?.message ||
            error.response.data?.message ||
            "Server error"
          }`
        );
      }
      if (error.request) {
        throw new Error("Network error - Please check your connection");
      }
    }
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

export const deleteFromImgBB = async (deleteUrl) => {
  if (!deleteUrl) {
    console.log("No delete URL provided");
    return;
  }

  try {
    console.log("Opening delete URL:", deleteUrl);
    const canOpen = await Linking.canOpenURL(deleteUrl);

    if (!canOpen) {
      throw new Error("Cannot open URL");
    }

    await Linking.openURL(deleteUrl);
    return true;
  } catch (error) {
    console.error("Failed to open delete URL:", error);
    Alert.alert("Error", "Could not open delete URL in browser");
    return false;
  }
};
