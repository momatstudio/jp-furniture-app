import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function Payment({ paymentNumber, amount, date, outstanding }) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.text1}>Payment number</Text>
        <Text>{paymentNumber}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.text1}>Amount payed</Text>
        <Text>R{amount}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.text1}>Date</Text>
        <Text>{date}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.text1}>Outstanding</Text>
        <Text>R{outstanding}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F3F3",
    padding: 10,
    marginVertical: 10,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text1: {
    fontWeight: "bold",
  },
});
