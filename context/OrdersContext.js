import React, { useState, useEffect, useContext, createContext } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../config/firebaseConfig";
import * as Linking from "expo-linking";
import * as NOTIFICATIONS from "expo-notifications";
import { router } from "expo-router";
import { Alert } from "react-native";
import useAsyncStorage from "../hooks/useAsyncStorage";

const db = getFirestore(app);
const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useAsyncStorage("orders", []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addOrderResults, setAddOrderResults] = useState("");

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for orders
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching items: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (id) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = { id: orderSnap.id, ...orderSnap.data() };
        return orderData;
      } else {
        console.error("No such order exists with the provided ID.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching order by ID: ", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (newOrder) => {
    setLoading(true);
    try {
      const { client, item, orderInfo, payments } = newOrder;

      const docRef = await addDoc(collection(db, "orders"), newOrder);

      const documentId = docRef.id;
      await updateDoc(docRef, { id: documentId });

      setOrders((prevOrders) => {
        const orderExists = prevOrders.some((order) => order.id === documentId);
        if (orderExists) {
          return prevOrders;
        }
        return [...prevOrders, { ...newOrder, id: documentId }];
      });

      setAddOrderResults("Order placed Successfully!");

      //Check if the preferred payment date is today and send a notification
      const today = new Date();
      const preferredDay = parseInt(client.preferredPaymentDate, 10);
      if (today.getDate() === preferredDay) {
        await NOTIFICATIONS.scheduleNotificationAsync({
          content: {
            title: "Payment Reminder",
            body: `Reminder for order ${item.title}: Payment is due today.`,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error("Error adding order: ", error);
      setAddOrderResults("Failed to add order!");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setAddOrderResults("");
      }, 4000);
    }
  };

  // Update Order
  const updateOrders = async (id, updatedOrder) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);

      await updateDoc(orderRef, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { id, ...updatedOrder } : order
        )
      );
      setAddOrderResults("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order: ", error);
    } finally {
      setLoading(false);
      setInterval(() => {
        setAddOrderResults("");
      }, 4000);
    }
  };

  const repossessOrder = async (id) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      const currentRepossessed = orderSnap.data().orderInfo.repossessed;
      const updatedRepossessed = !currentRepossessed;
      await updateDoc(orderRef, {
        "orderInfo.repossessed": updatedRepossessed,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                orderInfo: {
                  ...order.orderInfo,
                  repossessed: updatedRepossessed,
                },
              }
            : order
        )
      );
      // console.log("Success", "Order repossessed successfully.");
    } catch (error) {
      console.error("Error updating order: ", error);
    } finally {
      setLoading(false);
      // router.replace("(tabs)/orders");
    }
  };

  const archiveOrder = async (id) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      const currentArchived = orderSnap.data().orderInfo.archived;
      const updatedArchived = !currentArchived;
      await updateDoc(orderRef, { "orderInfo.archived": updatedArchived });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                orderInfo: {
                  ...order.orderInfo,
                  archived: updatedArchived,
                },
              }
            : order
        )
      );
      // console.log("Success", "Order archived successfully.");
    } catch (error) {
      console.error("Error updating order: ", error);
    } finally {
      setLoading(false);
      // router.replace("(tabs)/orders");
    }
  };

  const updateOrderPayment = async (id, newPayment, previousPayments) => {
    setLoading(true);
    try {
      const updatedPayments = [...previousPayments, newPayment];
      const orderRef = doc(db, "orders", id);

      await updateDoc(orderRef, { payments: updatedPayments });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, payments: updatedPayments } : order
        )
      );
    } catch (error) {
      console.error("Error updating payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Order
  const deleteOrder = async (id) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      await deleteDoc(orderRef);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));

      router.replace("(tabs)/orders");
    } catch (error) {
      console.error("Error deleting order: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = async (latitude, longitude) => {
    if (!latitude || !longitude) {
      Alert.alert("Error ", "Buyer location coordinates are not available.");
      return;
    }

    const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    const webUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    Linking.canOpenURL(geoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(geoUrl);
        } else {
          console.warn("geo: URL not supported. Falling back to web URL.");
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error("Error opening map URL:", err);
      });
  };

  const addNoteToOrder = async (id, note) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      const newNote = {
        text: note,
        date: new Date().toISOString(),
      };
      const updatedOrder = {
        ...orderData,
        notes: [...(orderData.notes || []), newNote],
      };

      await updateDoc(orderRef, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, notes: updatedOrder.notes } : order
        )
      );
      setAddOrderResults("Note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      setAddOrderResults("Failed to add note!");
    } finally {
      setLoading(false);
      setInterval(() => {
        setAddOrderResults("");
      }, 4000);
    }
  };

  const editNoteInOrder = async (id, noteIndex, newText) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      const updatedNotes = orderData.notes.map((note, index) =>
        index === noteIndex ? { ...note, text: newText } : note
      );
      const updatedOrder = {
        ...orderData,
        notes: updatedNotes,
      };

      await updateDoc(orderRef, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, notes: updatedOrder.notes } : order
        )
      );
      setAddOrderResults("Note edited successfully!");
    } catch (error) {
      console.error("Error editing note:", error);
      setAddOrderResults("Failed to edit note!");
    } finally {
      setLoading(false);
      setInterval(() => {
        setAddOrderResults("");
      }, 4000);
    }
  };

  const deleteNoteFromOrder = async (id, noteIndex) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      const updatedNotes = orderData.notes.filter(
        (_, index) => index !== noteIndex
      );
      const updatedOrder = {
        ...orderData,
        notes: updatedNotes,
      };

      await updateDoc(orderRef, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, notes: updatedOrder.notes } : order
        )
      );
      setAddOrderResults("Note deleted successfully!");
    } catch (error) {
      console.error("Error deleting note:", error);
      setAddOrderResults("Failed to delete note!");
    } finally {
      setLoading(false);
      setInterval(() => {
        setAddOrderResults("");
      }, 4000);
    }
  };

  const clearAllNotesFromOrder = async (id) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      const updatedOrder = {
        ...orderData,
        notes: [],
      };

      await updateDoc(orderRef, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, notes: [] } : order
        )
      );
      setAddOrderResults("All notes cleared successfully!");
    } catch (error) {
      console.error("Error clearing notes:", error);
      setAddOrderResults("Failed to clear notes!");
    } finally {
      setLoading(false);
      setInterval(() => {
        setAddOrderResults("");
      }, 4000);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchOrders();
    // TaskManager.unregisterAllTasksAsync().then(() => {
    //   TaskManager.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    // });
  }, []);

  const makeCall = (cellNumber1, cellNumber2) => {
    if (cellNumber1 && cellNumber2) {
      Alert.alert(
        "Select Number",
        "Which number would you like to call?",
        [
          {
            text: cellNumber1,
            onPress: () =>
              Linking.openURL(`tel:${cellNumber1}`).catch((err) =>
                Alert.alert("Error", "Unable to make a call. Please try again.")
              ),
          },
          {
            text: cellNumber2,
            onPress: () =>
              Linking.openURL(`tel:${cellNumber2}`).catch((err) =>
                Alert.alert("Error", "Unable to make a call. Please try again.")
              ),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } else if (cellNumber1) {
      Linking.openURL(`tel:${cellNumber1}`).catch((err) =>
        Alert.alert("Error", "Unable to make a call. Please try again.")
      );
    } else if (cellNumber2) {
      Linking.openURL(`tel:${cellNumber2}`).catch((err) =>
        Alert.alert("Error", "Unable to make a call. Please try again.")
      );
    } else {
      Alert.alert("Error", "Phone number is not available.");
    }
  };

  const value = {
    orders,
    items,
    loading,
    addOrderResults,
    fetchOrderById,
    fetchOrders,
    fetchItems,
    addOrder,
    updateOrders,
    deleteOrder,
    openGoogleMaps,
    updateOrderPayment,
    repossessOrder,
    archiveOrder,
    addNoteToOrder,
    editNoteInOrder,
    deleteNoteFromOrder,
    clearAllNotesFromOrder,
    makeCall,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
