import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { colors } from "@/assets/styles";

const FilterByDates = ({
  backgroundColor,
  date,
  color,
  onPress,
  buttonController,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: backgroundColor }]}
      // onPress={() =>
      //   buttonController?.setButtonActive(!buttonController?.buttonActive)
      // }
      onPress={onPress}
    >
      <Text
        style={{
          color: color,
        }}
      >
        {date}
      </Text>
    </TouchableOpacity>
  );
};

export default FilterByDates;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 5,
    marginRight: 10,
    padding: 5,
  },
});
