import { View, Text, StyleSheet, Animated } from "react-native";
import React, { useEffect, useRef } from "react";

const CustomAlert = ({ color, label }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[styles.alert, { backgroundColor: color, opacity: fadeAnim }]}
    >
      <Text style={styles.text2}>{label}</Text>
    </Animated.View>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  alert: {
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    height: 40,
    // paddingVertical: 4,
    position: "absolute",
    marginTop: "9%",
    borderRadius: 20,
  },
  text2: {
    textAlign: "center",
    color: "white",
  },
});
