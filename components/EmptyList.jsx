import { View, Text, StyleSheet, Dimensions } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

const EmptyList = ({ label }) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="inbox" size={50} color="gray" />
      <Text style={styles.noItemsText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // height: Dimensions.get("window").height - 200,
  },
  noItemsText: {
    fontSize: 20,
    color: "gray",
    marginTop: 10,
  },
});
export default EmptyList;
