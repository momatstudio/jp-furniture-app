import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Header,
  ScreenTitle,
  Item,
  CustomAlert,
  Search,
  OrderPreview,
  AddNewFurnitureModal,
} from "@/components";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useItems } from "@/context";
import { colors, sizes, fontWeights, shadows } from "../../assets/styles";
import { deleteFromImgBB } from "@/utils/imageUpload";

const Items = () => {
  const { items, loading, fetchItems, deleteItem, updateItem, success } =
    useItems();

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    imageUrl: "",
    description: "",
    category: "",
    inStock: true,
    dimensions: "",
    features: {
      Features: "",
      Benefits: "",
      Dimensions: "",
      "Credit Terms": "",
      Delivery: "",
      Returns: "",
      Dimentions: "",
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [editActive, setEditActive] = useState(false);
  const [itemId, setItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderPreviewVisible, setOrderPreviewVisible] = useState(false);

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const item = items.find((item) => item.id === id);
            if (item?.deleteUrl) {
              await deleteFromImgBB(item.deleteUrl);
              Alert.alert(
                "Image Deletion",
                "A browser window will open to delete the image. Please complete the deletion there.",
                [{ text: "OK" }]
              );
            }
            deleteItem(id);
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleUpdate = () => {
    try {
      updateItem(itemId, formData);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update item");
    } finally {
      setModalVisible(false);
      setEditActive(false);
    }
  };

  const editButtonHandler = (id) => {
    setEditActive(true);
    setModalVisible(true);

    const item = items.find((item) => item.id === id);
    setFormData({
      ...formData,
      ...item,
    });
    setItemId(id);
  };

  const clearInputFields = () => {
    setFormData({
      name: "",
      slug: "",
      price: "",
      imageUrl: "",
      description: "",
      category: "",
      inStock: true,
      dimensions: "",
      features: {
        Features: "",
        Benefits: "",
        Dimensions: "",
        "Credit Terms": "",
        Delivery: "",
        Returns: "",
        Dimentions: "",
      },
    });
  };

  // Filtered items based on search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrderPress = (item) => {
    setSelectedItem(item);
    setOrderPreviewVisible(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant gallery access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: result.assets[0].uri,
      }));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      activeOpacity={0.85}
      onPress={() => handleOrderPress(item)}
    >
      <Item
        imageUrl={item.imageUrl}
        name={item.name}
        price={item.price}
        onDelete={() => handleDelete(item.id)}
        onEdit={() => editButtonHandler(item.id)}
        onPress={() => handleOrderPress(item)}
        style={styles.itemInner}
      />
    </TouchableOpacity>
  );

  // --- Modal UI for Add/Edit Furniture (consistent with "New Order" modal) ---
  return (
    <>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Header showAlarmIcon={true} showProfileButton={false} user={null} />
        <ScreenTitle
          title="ITEMS"
          buttonLabel="item"
          setModalVisible={setModalVisible}
        />
        <View style={styles.section}>
          <Search
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={"Search items..."}
          />
        </View>
        {success && <CustomAlert color={colors.success} label={success} />}

        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchItems}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="sad-outline"
                size={sizes.xxl}
                color={colors.secondary}
              />
              <Text style={styles.noItemsText}>No Furnitures</Text>
            </View>
          }
        />
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editActive ? "Edit Furniture" : "Add New Furniture"}
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.cardSection}>
                {/* Name */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="Furniture name"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                    accessibilityLabel="Name"
                  />
                </View>
                {/* Price */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Price *</Text>
                  <TextInput
                    value={formData.price?.toString() || ""}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, price: text }))
                    }
                    placeholder="Price"
                    style={styles.input}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    accessibilityLabel="Price"
                  />
                </View>
                {/* Description */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, description: text }))
                    }
                    placeholder="Description"
                    style={[styles.input, { minHeight: 60 }]}
                    multiline
                    accessibilityLabel="Description"
                  />
                </View>
                {/* Category */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    value={formData.category}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, category: text }))
                    }
                    placeholder="Category"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                    accessibilityLabel="Category"
                  />
                </View>
                {/* Dimensions */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Dimensions</Text>
                  <TextInput
                    value={formData.dimensions}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, dimensions: text }))
                    }
                    placeholder="Dimensions"
                    style={styles.input}
                    accessibilityLabel="Dimensions"
                  />
                </View>
                {/* Features */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Features</Text>
                  <TextInput
                    value={formData.features?.Features}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        features: { ...prev.features, Features: text },
                      }))
                    }
                    placeholder="Features"
                    style={styles.input}
                    accessibilityLabel="Features"
                  />
                </View>
                {/* Image Picker & Preview */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Image</Text>
                  <View style={styles.imagePickerRow}>
                    <TouchableOpacity
                      style={styles.imagePickerBtn}
                      onPress={handlePickImage}
                      accessibilityLabel="Pick Image"
                    >
                      <MaterialIcons
                        name="photo-library"
                        size={sizes.l}
                        color={colors.primary}
                      />
                      <Text style={styles.imagePickerText}>Select Image</Text>
                    </TouchableOpacity>
                    {formData.imageUrl ? (
                      <Image
                        source={{ uri: formData.imageUrl }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>
                </View>
                {/* Image URL (manual entry, optional) */}
                <View style={[styles.inputRow, { display: "none" }]}>
                  <Text style={styles.inputLabel}>Image URL</Text>
                  <TextInput
                    value={formData.imageUrl}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, imageUrl: text }))
                    }
                    placeholder="Image URL"
                    style={styles.input}
                    accessibilityLabel="Image URL"
                  />
                </View>
                {/* In Stock */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>In Stock</Text>
                  <TouchableOpacity
                    style={[
                      styles.inStockBtn,
                      formData.inStock
                        ? styles.inStockActive
                        : styles.inStockInactive,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        inStock: !prev.inStock,
                      }))
                    }
                    accessibilityLabel="Toggle In Stock"
                  >
                    <Text
                      style={{
                        color: formData.inStock ? colors.white : colors.primary,
                        fontWeight: fontWeights.bold,
                      }}
                    >
                      {formData.inStock ? "Yes" : "No"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.modalActionBtn,
                    { backgroundColor: colors.success },
                  ]}
                  onPress={
                    editActive ? handleUpdate : () => setModalVisible(false)
                  }
                  accessibilityLabel={editActive ? "Update" : "Add"}
                >
                  <Text style={styles.modalActionText}>
                    {editActive ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={[
                    styles.modalActionBtn,
                    { backgroundColor: colors.danger },
                  ]}
                  onPress={() => {
                    setModalVisible(false);
                    setEditActive(false);
                    clearInputFields();
                  }}
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.modalActionText}>Cancel</Text>
                </TouchableOpacity> */}
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setEditActive(false);
                clearInputFields();
              }}
              style={styles.cancelButton}
              accessibilityLabel="Close Modal"
            >
              <Text style={{ fontSize: 30, color: colors.danger }}>×</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Order Preview Modal */}
      <OrderPreview
        visible={orderPreviewVisible}
        onClose={() => setOrderPreviewVisible(false)}
        item={selectedItem}
        onEdit={() => {
          setOrderPreviewVisible(false);
          editButtonHandler(selectedItem?.id);
        }}
        onDelete={() => {
          setOrderPreviewVisible(false);
          handleDelete(selectedItem?.id);
        }}
      />
    </>
  );
};

export default Items;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
    padding: sizes.padding,
  },
  section: {
    width: "100%",
    marginBottom: sizes.s,
  },
  listContainer: {
    width: "100%",
    paddingBottom: sizes.xl,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: sizes.radius,
    marginBottom: sizes.s,
    // ...shadows.card,
    padding: 0,
  },
  itemInner: {
    padding: 0,
  },
  noItemsText: {
    marginTop: sizes.m,
    fontSize: sizes.l,
    color: colors.gray,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: sizes.m,
  },
  // Modal styles
  modalKeyboardAvoid: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  modalCard: {
    padding: sizes.padding,
    width: "96%",
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    borderRadius: sizes.radius + 6,
    backgroundColor: colors.card,
    ...shadows.modal,
    flex: 1,
  },
  modalTitle: {
    fontWeight: fontWeights.bold,
    fontSize: sizes.l,
    color: colors.primary,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  cardSection: {
    backgroundColor: colors.secondary,
    borderRadius: sizes.radius,
    padding: sizes.s,
    marginBottom: sizes.m,
    marginTop: 4,
    elevation: 1,
  },
  inputRow: {
    marginBottom: sizes.s,
  },
  inputLabel: {
    fontWeight: fontWeights.medium,
    fontSize: sizes.sm,
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 2,
  },
  input: {
    paddingHorizontal: sizes.xs,
    fontSize: sizes.m,
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: sizes.radius - 4,
    minHeight: 44,
    borderWidth: sizes.border,
    borderColor: colors.lightGray,
    marginTop: 2,
  },
  inStockBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: sizes.radius - 4,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    marginTop: 2,
    borderWidth: 1,
  },
  inStockActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  inStockInactive: {
    backgroundColor: colors.lighterGray,
    borderColor: colors.primary,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: sizes.m,
    gap: 10,
  },
  modalActionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: sizes.radius - 2,
    marginHorizontal: 2,
  },
  modalActionText: {
    color: colors.white,
    fontWeight: fontWeights.bold,
    fontSize: sizes.m,
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 8,
  },
  imagePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lighterGray,
    borderRadius: sizes.radius - 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  imagePickerText: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginLeft: 6,
    fontSize: sizes.sm,
  },
  imagePreview: {
    width: 48,
    height: 48,
    borderRadius: sizes.radius - 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginLeft: 6,
    backgroundColor: colors.lighterGray,
  },
});
