import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_FETCH_TASK = "BACKGROUND_FETCH_TASK";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Get stored orders from AsyncStorage
    const ordersJson = await AsyncStorage.getItem("orders");
    // const clientsJson = await AsyncStorage.getItem("clients");

    if (ordersJson) {
      const orders = JSON.parse(ordersJson);
      const dates = orders.map((order) => order?.client?.preferredPaymentDate);
      const today = new Date();

      for (const order of orders) {
        if (!order?.client?.preferredPaymentDate) continue;

        const paymentDate = new Date(order?.client.preferredPaymentDate);
        if (paymentDate.getDate() === today.getDate()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Payment Due Today",
              body: `Payment is due today for client ${order?.client?.name}`,
              data: { clientId: order.id },
            },
            trigger: {
              type: "calendar",
              hour: 9, // Send at 9 AM
              minute: 0,
              repeats: false,
            },
          });
        }
      }
      return BackgroundFetch.Result.NewData;
    }
  } catch (error) {
    console.error("Background fetch failed:", error);
    return BackgroundFetch.Result.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 60, // 1 hour
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (err) {
    console.error("Task Registration failed:", err);
  }
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};
