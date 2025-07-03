import { useItems, useOrders } from "@/context/";
import { deleteFromImgBB } from "@/utils/imageUpload";
import * as NOTIFICATIONS from "expo-notifications";
import { Alert } from "react-native";

export async function configureNotifications() {
  NOTIFICATIONS.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export const checkAndNotify = async () => {
  const today = new Date();
  const { order } = useOrders();

  const todayOrders = order.filter((order) => {
    const preferredDay = parseInt(order?.client?.preferredPaymentDate, 10);
    const isRepossessedOrArchived =
      order.orderInfo.repossessed || order.orderInfo.archived;
    return today.getDate() === preferredDay && !isRepossessedOrArchived;
  });

  // Schedule notifications for each order
  for (const order of todayOrders) {
    await NOTIFICATIONS.scheduleNotificationAsync({
      content: {
        title: `Payment Reminder from ${order?.client?.name}`,
        body: `Reminder for order: ${order?.item?.title}: Payment is due today.`,
      },
      trigger: {
        hour: 9, // Send at 9 AM
        minute: 0,
        repeats: true,
      },
    });
  }
};

// Helper function to get past 6 months
export const getPastSixMonths = () => {
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
};

// Order helpers
export const filterByDate = (order, selectedDate) =>
  selectedDate ? order.client.preferredPaymentDate === selectedDate : true;

export const filterByType = (order, filterType) => {
  const isPaidThisMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return order.payments?.some((payment) => {
      const paymentDate = new Date(payment.date);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });
  };

  return (
    filterType === "All" ||
    (filterType === "Active" &&
      !order.orderInfo.archived &&
      !order.orderInfo.repossessed) ||
    (filterType === "Archived" && order.orderInfo.archived) ||
    (filterType === "Repossessed" && order.orderInfo.repossessed) ||
    (filterType === "Paid" && isPaidThisMonth()) ||
    (filterType === "Unpaid" && !isPaidThisMonth())
  );
};

export const searchInOrder = (order, query) => {
  if (!query) return true;
  const searchText = query.toLowerCase();
  return (
    order?.client?.firstName?.toLowerCase().includes(searchText) ||
    order?.client?.lastName?.toLowerCase().includes(searchText) ||
    order?.items?.[0]?.title?.toLowerCase().includes(searchText) ||
    order?.client?.primaryPhone?.includes(searchText) ||
    order?.client?.address?.toLowerCase().includes(searchText)
  );
};

export const validateForm = (formData) => {
  const item = formData.selectedItem;
  const hasValidItem =
    item &&
    typeof item === "object" &&
    ((item.id && String(item.id).trim() !== "") ||
      (item.title && String(item.title).trim() !== ""));
  return (
    formData.firstName &&
    formData.lastName &&
    formData.primaryPhone &&
    formData.address &&
    formData.preferredPaymentDate &&
    formData.quantity && // fixed typo here
    hasValidItem
  );
};

export const createOrderFromForm = (formData) => {
  // Defensive: Remove undefined fields from client and items
  const clean = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    );

  // Calculate order financials
  const quantity =
    formData.quantity !== undefined ? parseInt(formData.quantity, 10) : 1;
  const price =
    formData.selectedItem?.price !== undefined
      ? parseFloat(formData.selectedItem.price)
      : 0;
  const shipping = 0; // fixed shipping cost, adjust as needed
  const subtotal = price * quantity;
  const tax = Math.round(subtotal * 0 * 100) / 100; // 15% tax, rounded to 2 decimals
  const total = subtotal + shipping + tax;

  return {
    client: clean({
      firstName: formData.firstName,
      lastName: formData.lastName,
      primaryPhone: formData.primaryPhone,
      secondaryPhone: formData.secondaryPhone,
      address: formData.address,
      city: formData.city,
      region: formData.region,
      postalCode: formData.postalCode,
      latitude: formData.latitude,
      longitude: formData.longitude,
      preferredPaymentDate: formData.preferredPaymentDate,
    }),
    items: [
      clean({
        id: formData.selectedItem?.id,
        imageUrl: formData.selectedItem?.imageUrl,
        title: formData.selectedItem?.title,
        price,
        quantity,
      }),
    ],
    orderInfo: {
      orderDate: new Date().toISOString().split("T")[0],
      orderNumber: `JP-${Math.floor(10000 + Math.random() * 90000)}`,
      // shipping,
      // status: "Pending",
      // subtotal,
      // tax,
      // total,
    },
    payments: [],
    shipping,
    status: "Pending",
    subtotal,
    tax,
    total,
  };
};

export const clearFormData = {
  data: {
    firstName: "",
    lastName: "",
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
    latitude: "",
    longitude: "",
    preferredPaymentDate: "",
    city: "",
    region: "",
    postalCode: "",
    quantity: "", // add quantity here
  },
  errors: null,
  isSubmitting: false,
};
