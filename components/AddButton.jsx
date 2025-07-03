import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/assets/styles";

export default function AddButton({ setModalVisible, label }) {
  // console.log(buttonLabel);
  return (
    <TouchableOpacity
      style={styles.button2}
      onPress={() => setModalVisible(true)}
    >
      <Ionicons name="add-circle" size={24} color={colors.white} />
      <Text style={styles.text1}>New {label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button2: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    padding: 5,
    paddingHorizontal: 10,
    width: "auto",
    height: 34,
    borderRadius: 20,
  },
  text1: {
    color: colors.white,
    fontWeight: "bold",
    paddingLeft: 2,
  },
});
