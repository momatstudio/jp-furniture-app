import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/assets/styles";

export default function Client({
  image,
  name,
  address,
  cellNumber,
  cellNumberTwo,
  makeCall,
}) {
  const [initials, setInitials] = useState("");

  useEffect(() => {
    getInitials(name);
  }, []);

  const getInitials = (name) => {
    if (!name) setInitials("?");

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      setInitials(parts[0].charAt(0).toUpperCase()); // Single name
    }

    setInitials(
      parts[0].charAt(0).toUpperCase() +
        parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const makeCallHandler = () => {
    makeCall(cellNumber, cellNumberTwo);
  };
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.image}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.textGroup2}>
          <Text style={styles.text1}>{address}</Text>
          <Text style={styles.text1}>{cellNumber}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.call} onPress={makeCallHandler}>
        <Ionicons name="call" size={25} color={colors.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  image: {
    justifyContent: "center",
    alignItems: "center",
    height: 63,
    width: 63,
    borderRadius: 31.5,
    backgroundColor: "#D9D9D9",
  },
  initials: {
    fontSize: 17,
    fontWeight: "900",
  },
  textGroup: {
    flex: 1,
    paddingLeft: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    color: colors.primary,
  },
  textGroup2: {
    paddingTop: 2,
  },
  text1: {
    fontSize: 13,
  },

  call: {
    padding: 10,
    // backgroundColor: "#D9D9D9",
    backgroundColor: colors.primary,
    borderRadius: 50,
  },
});
