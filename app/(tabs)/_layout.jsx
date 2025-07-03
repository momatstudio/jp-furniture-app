import "react-native-get-random-values";
import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ItemsProvider } from "../../context/ItemsContext";
import { OrdersProvider } from "../../context/OrdersContext";
import { colors } from "@/assets/styles";
import {
  registerBackgroundTask,
  requestNotificationPermissions,
} from "@/services/NotificationService";

const TabsLayout = () => {
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await registerBackgroundTask();
          console.log("Notifications initialized successfully");
        } else {
          console.warn("Notification permissions not granted");
        }
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initNotifications();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        headerStyle: {
          backgroundColor: "white",
        },
        headerShadowVisible: false,
        headerShown: false,
        headerTintColor: "black",
        tabBarStyle: {
          backgroundColor: "white",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          //   headerTitle: "Furniture Management App",
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={30}
              color={focused ? colors.primary : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          headerTitle: "Items",
          tabBarLabel: "Items",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "pricetags" : "pricetags-outline"}
              size={30}
              color={focused ? colors.primary : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          headerTitle: "Orders",
          tabBarLabel: "Orders",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "reorder-four" : "reorder-four-outline"}
              size={30}
              color={focused ? colors.primary : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          headerTitle: "Clients",
          tabBarLabel: "Clients",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={30}
              color={focused ? colors.primary : "black"}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default function RootLayout() {
  return (
    <OrdersProvider>
      <ItemsProvider>
        <TabsLayout />
      </ItemsProvider>
    </OrdersProvider>
  );
}
