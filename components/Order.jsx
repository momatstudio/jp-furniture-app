import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { colors } from "@/assets/styles";

export default function Order({ orderDetails }) {
  const { items, client, orderInfo, payments, id } = orderDetails;

  const coloringHandler = () => {
    if (orderInfo.repossessed) {
      return colors.warning;
    } else if (orderInfo.archived) {
      return colors.success;
    } else {
      return colors.primary;
    }
  };

  const orderStatusHandler = () => {
    if (orderInfo?.repossessed) {
      return "Repossessed";
    }
    if (orderInfo?.archived) {
      return "Archived";
    } else return "";
  };

  const isPaidThisMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return payments?.some((payment) => {
      const paymentDate = new Date(payment.date);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });
  };

  return (
    <Link href={`/order/${id}`} key={id} asChild>
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: "row",
          width: 375,
          marginBottom: 20,
          borderRadius: 11,
        }}
      >
        <View style={styles.image}>
          {items[0]?.imageUrl && (
            <Image
              source={{
                uri: items[0]?.imageUrl,
              }}
              style={{ width: 65, height: 65 }}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.textGroup}>
          <View style={styles.textGroup2}>
            <Text
              style={{
                fontWeight: "bold",
                color: coloringHandler(),
              }}
            >
              {items[0]?.title}
            </Text>
            <Text
              style={[
                styles.text2,
                { color: coloringHandler(), fontWeight: "bold" },
              ]}
            >
              {orderStatusHandler()}
            </Text>
          </View>
          <View style={styles.textGroup2}>
            <Text style={[styles.text1, { color: colors.black }]}>
              {"Order by " + client?.firstName + " " + client?.lastName}
            </Text>
            <Text style={[styles.text1, { color: colors.black }]}>
              {items[0]?.quantity + "x" + "R" + items[0]?.price}
            </Text>
          </View>
          <View style={styles.textGroup2}>
            <Text style={[styles.text1, { color: colors.black }]}>
              Preferred payment date:{" "}
            </Text>
            <Text style={[styles.text1, { color: colors.black }]}>
              {client?.preferredPaymentDate}
            </Text>
          </View>
          <View style={styles.textGroup2}>
            <Text style={[styles.text1, { color: colors.black }]}>
              Payment status:{" "}
            </Text>
            <Text
              style={[
                styles.text1,
                {
                  color: isPaidThisMonth() ? colors.success : colors.danger,
                },
              ]}
            >
              {isPaidThisMonth() ? "Paid" : "Not paid"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export const options = {
  headerShown: false, // Hides the header
};

const styles = StyleSheet.create({
  container: {},
  image: {
    justifyContent: "center",
    alignItems: "center",
    height: 75,
    width: 75,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  textGroup: {
    flex: 1,
    paddingHorizontal: 5,
  },
  title: {
    fontWeight: "900",
  },
  textGroup2: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  text1: {
    width: 200,
  },
  text2: {},
});
