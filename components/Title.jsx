import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function Title({ title }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.text3}>{title}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  heading: {
    width: "100%",
    height: 200,
    justifyContent: "center",
  },
  text3: {
    fontWeight: "900",
    fontSize: 40,
  },
});
