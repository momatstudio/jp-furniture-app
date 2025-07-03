import React from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { Header, ScreenTitle, Client } from "@/components";
import { useOrders } from "../../context/OrdersContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors, sizes, fontWeights, shadows } from "@/assets/styles";

const Clients = () => {
  const { orders, fetchOrders, loading, makeCall } = useOrders();

  // Group clients by unique phone number (primaryPhone)
  const uniqueClientsMap = {};
  orders.forEach((order) => {
    const phone = order?.client?.primaryPhone;
    if (phone && !uniqueClientsMap[phone]) {
      uniqueClientsMap[phone] = order;
    }
  });
  const uniqueClients = Object.values(uniqueClientsMap);

  const renderItemHandler = ({ item }) => (
    <View style={styles.clientCard}>
      <Client
        image={item?.image}
        name={item?.client?.firstName + " " + item?.client?.lastName}
        address={item?.client?.address}
        cellNumber={item?.client?.primaryPhone}
        cellNumberTwo={item?.client?.secondaryPhone}
        makeCall={makeCall}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header showAlarmIcon={true} />
      <ScreenTitle title="CLIENTS LIST" />

      <FlatList
        style={styles.clients}
        data={uniqueClients}
        keyExtractor={(item, index) =>
          `${item?.client?.primaryPhone || item.id}-${index}`
        }
        renderItem={renderItemHandler}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchOrders}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="sad-outline"
              size={sizes.xxl}
              color={colors.secondary}
            />
            <Text style={styles.noItemsText}>No Clients</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
export default Clients;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    padding: sizes.padding,
  },
  clients: {
    width: "100%",
  },
  clientCard: {
    backgroundColor: colors.card,
    borderRadius: sizes.radius,
    marginBottom: sizes.s,
    // ...shadows.card,
    padding: 0,
  },
  listContent: {
    paddingBottom: sizes.xl,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: sizes.l,
  },
  noItemsText: {
    marginTop: sizes.m,
    fontSize: sizes.l,
    color: colors.gray,
    textAlign: "center",
  },
});
