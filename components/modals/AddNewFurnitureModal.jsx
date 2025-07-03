import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useItems } from "@/context";
import { Title, CustomAlert, CustomButton } from "@/components";
import { colors } from "../../assets/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { pickImage, uploadToImgBB } from "@/utils/imageUpload";

const AddNewFurnitureModal = ({
  setModalVisible,
  modalVisible,
  editActive,
  setEditActive,
  clearInputFields,
  formData,
  setFormData,
  handleUpdate,
}) => {
  const [errorReturned, setErrorReturned] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { addItem, loading } = useItems();

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (text) => {
    setFormData({
      ...formData,
      name: text,
      slug: generateSlug(text),
    });
  };

  const handleImagePick = async () => {
    try {
      setUploading(true);
      const imageAsset = await pickImage();

      if (!imageAsset) return;

      const imageData = await uploadToImgBB(imageAsset.base64);

      if (!imageData.url) {
        throw new Error("No URL received from upload");
      }

      setFormData({
        ...formData,
        imageUrl: imageData.url,
        deleteUrl: imageData.deleteUrl,
      });
    } catch (error) {
      Alert.alert(
        "Image Upload Error",
        error.message || "Failed to upload image"
      );
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    try {
      if (!formData.name || !formData.price || !formData.imageUrl) {
        setErrorReturned(true);
        setTimeout(() => setErrorReturned(false), 4000);
        return;
      }

      addItem(formData);
      clearInputFields();
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <Title title={editActive ? "Edit Furniture" : "Add New Furniture"} />
        {errorReturned && (
          <CustomAlert
            color={colors.danger}
            label="Please fill all required fields!"
          />
        )}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={styles.text1}>Upload image</Text>
            <View style={styles.imageSection}>
              {formData.imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: formData.imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    <MaterialIcons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleImagePick}
                  style={styles.uploadContainer}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <MaterialIcons
                        name="cloud-upload"
                        size={40}
                        color={colors.primary}
                      />
                      <Text style={styles.uploadText}>Tap to upload image</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputView}>
              <Text style={styles.text1}>Item Title</Text>
              <TextInput
                placeholder="Title"
                value={formData.name}
                onChangeText={handleTitleChange}
              />
            </View>

            <View style={styles.inputView}>
              <Text style={styles.text1}>Slug</Text>
              <TextInput
                placeholder="URL-friendly name"
                value={formData.slug}
                editable={false}
                style={styles.disabledInput}
              />
            </View>

            <View style={styles.inputView}>
              <Text style={styles.text1}>Price</Text>
              <TextInput
                placeholder="Price"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputView}>
              <Text style={styles.text1}>Category</Text>
              <TextInput
                placeholder="Category"
                value={formData.category}
                onChangeText={(text) =>
                  setFormData({ ...formData, category: text })
                }
              />
            </View>

            <View style={styles.inputView}>
              <Text style={styles.text1}>Description</Text>
              <TextInput
                placeholder="Description"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            </View>

            {/* <View style={styles.inputView}>
              <Text style={styles.text1}>Dimensions</Text>
              <TextInput
                placeholder="Dimensions"
                value={formData.dimensions}
                onChangeText={(text) =>
                  setFormData({ ...formData, dimensions: text })
                }
              />
            </View> */}
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features & Details</Text>

            {Object.keys(formData.features).map((feature) => (
              <View key={feature} style={styles.inputView}>
                <Text style={styles.text1}>{feature}</Text>
                <TextInput
                  placeholder={`Enter ${feature.toLowerCase()}`}
                  value={formData.features[feature]}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      features: {
                        ...formData.features,
                        [feature]: text,
                      },
                    })
                  }
                  multiline={feature === "Features" || feature === "Benefits"}
                  numberOfLines={
                    feature === "Features" || feature === "Benefits" ? 3 : 1
                  }
                  style={
                    feature === "Features" || feature === "Benefits"
                      ? styles.textArea
                      : null
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <CustomButton
            label={
              loading ? (
                <ActivityIndicator size="40" color={colors.white} />
              ) : editActive ? (
                "Update"
              ) : (
                "Add Item"
              )
            }
            onPress={editActive ? handleUpdate : handleAdd}
            backgroundColor={colors.primary}
          />

          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setEditActive(false);
              clearInputFields();
            }}
          >
            <View style={styles.cancelButton}>
              <Text style={{ fontSize: 30 }}>X</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddNewFurnitureModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    padding: 15,
  },
  listContainer: {
    width: "100%",
  },
  noItemsText: {
    marginTop: 20,
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
  // Modal
  modalContainer: {
    padding: 10,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  inputView: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: colors.gray,
  },
  text1: {
    fontWeight: "900",
    fontSize: 15,
  },
  cancelButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  imageUploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  imageInput: {
    flex: 1,
    paddingHorizontal: 1,
  },
  uploadButton: {
    padding: 5,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 5,
  },
  buttonContainer: {
    paddingVertical: 10,
  },
  disabledInput: {
    color: colors.gray,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 5,
  },
  imageSection: {
    marginVertical: 10,
    minHeight: 200,
  },
  imagePreviewContainer: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    padding: 5,
  },
  uploadContainer: {
    width: "100%",
    height: 200,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 16,
  },
});
