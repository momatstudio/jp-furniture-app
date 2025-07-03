import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      // Handle the notification data here
      console.log("Received background notification:", data);
    }
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
