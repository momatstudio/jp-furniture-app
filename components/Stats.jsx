import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { colors } from "../assets/styles";

export default function Stats({ title, count, color, route }) {
  return (
    <Link href={`${route}`} key={route} asChild>
      <TouchableOpacity style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.cycle, { backgroundColor: color }]}>
          <Text style={styles.number}>{count}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    width: 170,
    margin: 10,
  },
  title: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "900",
    width: 110,
    paddingBottom: 5,
  },
  cycle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    height: 150,
    width: 150,
    borderRadius: 85,
  },
  number: {
    fontSize: 50,
    fontWeight: "900",
    color: "white",
    color: colors.white,
  },
});
