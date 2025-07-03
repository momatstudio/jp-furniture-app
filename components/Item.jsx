import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { colors, sizes } from "@/assets/styles";
import { MaterialIcons } from "@expo/vector-icons";

export default function Item({
  imageUrl,
  name,
  price,
  onDelete,
  onEdit,
  onPress,
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>R{price}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
          <MaterialIcons name="edit" size={24} color={colors.primary} />
        </TouchableOpacity> */}
        {/* <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <MaterialIcons name="delete" size={24} color={colors.danger} />
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  details: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 15,
    color: colors.primary,
  },
  price: {
    fontSize: 14,
    color: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: 3,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
