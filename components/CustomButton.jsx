// components/CustomButton.jsx

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "@/assets/styles";

export default function CustomButton({
  label,
  onPress,
  backgroundColor,
  color,
}) {
  const [labeller, setLabeller] = useState(label);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: backgroundColor }]}
      onPress={onPress}
    >
      <Text style={[styles.text3, { color: color ? color : colors.white }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    // flex: 1,
    justifyContent: "center",
    height: 43,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 5,
    // paddingHorizontal: 1,
  },
  text3: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
