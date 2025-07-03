import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "@/config/firebaseConfig";

interface Order {
  id: string;
  client?: {
    name?: string;
    preferredPaymentDate?: string;
  };
  orderInfo?: {
    archived?: boolean;
    repossessed?: boolean;
    orderDate?: string;
    orderNumber?: string;
  };
}

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// Configure notifications with retry mechanism
Notifications.setNotificationHandler({
  handleNotification: async () => {
    try {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    } catch (error) {
      console.error("Error handling notification:", error);
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
  },
});

// Define the background task with better error handling
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    const db = getFirestore(app);

    const querySnapshot = await getDocs(collection(db, "orders"));

    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    const today = new Date();

    const ordersToRemind = orders.filter((order) => {
      const preferredDay = parseInt(
        order?.client?.preferredPaymentDate ?? "0",
        10
      );
      return today.getDate() === preferredDay;
    });

    if (ordersToRemind.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Today's Reminder",
          body: "You have orders to follow up on today.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background fetch failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(
      BACKGROUND_NOTIFICATION_TASK
    ).catch(() => {});

    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 60 * 60, // 1 hour
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return true;
  } catch (err) {
    console.error("Task Registration failed:", err);
    return false;
  }
};

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      return status === "granted";
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

// Add utility functions for notification management
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error("Error cancelling notifications:", error);
    return false;
  }
};
