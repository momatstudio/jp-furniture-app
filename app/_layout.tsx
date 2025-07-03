import "react-native-get-random-values";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../context/AuthContext";
import { OrdersProvider, useOrders } from "../context/OrdersContext";
import {
  registerBackgroundTask,
  requestNotificationPermissions,
} from "../services/NotificationService";

const Layout = () => {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OrdersProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="auth/login"
              options={{
                headerTitle: "Login in",
              }}
            />
            <Stack.Screen
              name="auth/update_user"
              options={{
                headerTitle: "Personal Info",
              }}
            />
            <Stack.Screen
              name="reminder/reminder"
              options={{
                headerTitle: "Reminder",
              }}
            />
          </Stack>
        </OrdersProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default Layout;
