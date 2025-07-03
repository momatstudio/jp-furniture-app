import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import AddButton from "@/components/AddButton";

export default function ScreenTitle({ title, setModalVisible, buttonLabel }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {buttonLabel && (
        <AddButton setModalVisible={setModalVisible} label={buttonLabel} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    width: "100%",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
