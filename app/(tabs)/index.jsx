import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { ScreenTitle, Header } from "@/components";
import { Redirect } from "expo-router";
import { useAuth, useOrders, useItems } from "@/context";
import { colors } from "@/assets/styles";
import { StatusBar } from "expo-status-bar";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import {
  configureNotifications,
  checkAndNotify,
  getPastSixMonths,
} from "@/actions";

function Index() {
  const { user } = useAuth();
  const { items } = useItems();
  const { orders } = useOrders();
  // const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    configureNotifications();
    checkAndNotify();
  }, []);

  const outstandingOrders = orders.filter(
    (order) => !order?.orderInfo?.repossessed && !order?.orderInfo?.archived
  );

  const repossessedItems = orders.filter(
    (order) => order?.orderInfo?.repossessed
  );

  const archivedOrders = orders?.filter((order) => order?.orderInfo?.archived);

  const orderStatusData = {
    labels: ["Active", "Archived", "Repossessed"],
    legend: ["Active Orders", "Archived Orders", "Repossessed Orders"],
    data: [
      parseInt(outstandingOrders?.length || 0, 10),
      parseInt(archivedOrders?.length || 0, 10),
      parseInt(repossessedItems?.length || 0, 10),
    ],
    colors: [colors.primary, "#7dee9d", colors.warning],
  };

  // Calculate total for percentages
  const totalOrders = orderStatusData.data.reduce((a, b) => a + b, 0);

  // Convert to pie chart format
  const orderStatusPieData = orderStatusData.labels.map((label, index) => ({
    name: label,
    orders: orderStatusData.data[index],
    percentage: ((orderStatusData.data[index] / totalOrders) * 100).toFixed(1),
    color: orderStatusData.colors[index],
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  }));

  // New data preparation methods
  const furnitureData = {
    labels:
      items?.slice(0, 6).map((item) => item?.name?.slice(0, 8) || "Unknown") ||
      [],
    datasets: [
      {
        data:
          items?.slice(0, 6).map((item) => {
            return (
              orders?.filter(
                (order) =>
                  order?.item?.id === item?.id &&
                  !order?.orderInfo?.repossessed &&
                  !order?.orderInfo?.archived
              ).length || 0
            );
          }) || [],
      },
    ],
  };

  // Helper function to get past 6 months
  const pastSixMonths = getPastSixMonths();

  const monthlySalesData = {
    labels: pastSixMonths.map((m) => `${m.label} ${m.year}`),
    datasets: [
      {
        data: pastSixMonths.map(({ month, year }) => {
          return (
            orders?.filter((order) => {
              const orderDate = new Date(order?.orderInfo?.orderDate);
              return (
                orderDate.getMonth() === month &&
                orderDate.getFullYear() === year &&
                !order?.orderInfo?.repossessed
              );
            }).length || 0
          );
        }),
      },
    ],
  };

  const monthlyRevenueData = {
    labels: pastSixMonths.map((m) => `${m.label} ${m.year}`),
    datasets: [
      {
        data: pastSixMonths.map(({ month, year }) => {
          return (
            orders?.reduce((sum, order) => {
              // Sum up all payments made in this month/year
              const monthlyPayments =
                order?.payments?.reduce((paymentSum, payment) => {
                  const paymentDate = new Date(payment.date);
                  if (
                    paymentDate.getMonth() === month &&
                    paymentDate.getFullYear() === year
                  ) {
                    return paymentSum + (Number(payment.amount) || 0);
                  }
                  return paymentSum;
                }, 0) || 0;

              return sum + monthlyPayments;
            }, 0) || 0
          );
        }),
      },
    ],
  };

  const maxOrders = Math.max(...(furnitureData?.datasets[0]?.data || [0]));

  return user ? (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header showAlarmIcon={true} showProfileButton={true} user={user} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="OVERVIEW" showButton={false} />
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Order Distribution</Text>
          <View style={styles.pieChartWrapper}>
            <PieChart
              data={orderStatusPieData}
              width={200}
              height={200}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="orders"
              backgroundColor="transparent"
              absolute
              hasLegend={false}
              center={[50, 0]}
              paddingLeft={0}
            />
            <View style={styles.legendRight}>
              {orderStatusPieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[styles.colorBox, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendItemText}>
                    {item.name}: {item.orders} ({item.percentage}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top 6 Furniture Sales</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={furnitureData}
              width={Math.max(
                Dimensions.get("window").width,
                furnitureData.labels.length * 100
              )}
              height={220}
              yAxisSuffix=" orders"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 128, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                barPercentage: 0.5,
              }}
              style={{ borderRadius: 16 }}
              showValuesOnTopOfBars
            />
          </ScrollView>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Sales</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={monthlySalesData}
              width={Math.max(
                Dimensions.get("window").width,
                monthlySalesData.labels.length * 100
              )}
              height={220}
              yAxisSuffix=" orders"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </ScrollView>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Revenue</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={monthlyRevenueData}
              width={Math.max(
                Dimensions.get("window").width,
                monthlyRevenueData.labels.length * 100
              )}
              height={220}
              yAxisLabel="R"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(128, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                formatYLabel: (value) => Math.round(value).toLocaleString(),
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  ) : (
    <Redirect href={"/auth/login"} />
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  container2: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },

  box: {
    justifyContent: "center",
    alignItems: "center",
    width: 180,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  text1: {
    fontWeight: "900",
    fontSize: 15,
    color: "white",
  },

  header: {
    height: 70,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "black",
    width: 150,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    width: "100%",
    // backgroundColor: "blue",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  legendText: {
    fontSize: 12,
    marginHorizontal: 5,
    marginVertical: 2,
  },
  pieChartWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 20,
    paddingHorizontal: 10,
  },
  pieContainer: {
    width: "65%",
    alignItems: "center",
    justifyContent: "center",
  },
  legendRight: {
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 120,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  legendItemText: {
    fontSize: 12,
    flex: 1,
    flexWrap: "wrap",
  },
});
