import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/assets/styles";

const NumericKeyboard = ({ onPress, onDelete, onDone }) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <View style={styles.keyboard}>
      <View style={styles.keysContainer}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => onPress(key)}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={onDelete}>
          <MaterialIcons name="backspace" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.key, styles.doneKey]} onPress={onDone}>
          <Text style={[styles.keyText, { color: colors.white }]}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  keysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  key: {
    width: "30%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    margin: 5,
    borderRadius: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  doneKey: {
    backgroundColor: colors.primary,
  },
  keyText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: "500",
  },
});

export default NumericKeyboard;
