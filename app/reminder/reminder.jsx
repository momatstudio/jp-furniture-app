import React, { useEffect, useState } from "react";
import * as NOTIFICATIONS from "expo-notifications";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrders } from "@/context/OrdersContext";
import Order from "@/components/Order";
import Header from "@/components/Header";
import ScreenTitle from "@/components/ScreenTitle";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import EmptyList from "../../components/EmptyList";
import { colors, sizes, fontWeights, shadows } from "@/assets/styles";

const Reminder = () => {
  const { orders } = useOrders();
  const router = useRouter();
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const today = new Date();
    const todayOrders = orders.filter((order) => {
      const preferredDay = parseInt(order?.client?.preferredPaymentDate, 10);
      const isRepossessedOrArchived =
        order.orderInfo.repossessed || order.orderInfo.archived;
      return today.getDate() === preferredDay && !isRepossessedOrArchived;
    });
    setFilteredOrders(todayOrders);
  }, [orders]);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Order orderDetails={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          accessibilityLabel="Back"
        >
          <Ionicons
            name={"arrow-back-outline"}
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Header showAlarmIcon={false} />
      </View>
      <ScreenTitle title="TODAY'S REMINDERS" />
      <Text style={styles.reminderInfo}>
        These are orders with payment due today.
      </Text>
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={sizes.xxl}
              color={colors.gray}
            />
            <Text style={styles.emptyText}>No reminders for today</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: sizes.padding,
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sizes.s,
    marginTop: sizes.s,
  },
  headerBackBtn: {
    marginRight: sizes.s,
    padding: sizes.xs / 2,
  },
  listContainer: {
    paddingBottom: sizes.xl,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: sizes.radius,
    marginBottom: sizes.s,
    ...shadows.card,
    padding: 0,
  },
  reminderInfo: {
    color: colors.gray,
    fontSize: sizes.sm,
    marginBottom: sizes.s,
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: sizes.l,
  },
  emptyText: {
    color: colors.gray,
    fontSize: sizes.l,
    marginTop: 10,
    fontWeight: fontWeights.medium,
    textAlign: "center",
  },
});

export default Reminder;
