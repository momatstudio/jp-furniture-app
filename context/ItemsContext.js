import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { app } from "../config/firebaseConfig";

// Initialize Firestore
const db = getFirestore(app);

// 1. Create Context
const ItemsContext = createContext();

// 2. Custom Hook for easy access
export const useItems = () => useContext(ItemsContext);

// 3. Provider Component
export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Fetch Items from Firestore
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
      Alert.alert("Error", "Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new item
  const addItem = async (newItem) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "items"), newItem);
      setItems([...items, { id: docRef.id, ...newItem }]);
      setSuccess("Item added successfully!");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error adding item: ", error);
      setSuccess("Error adding item");
    } finally {
      setInterval(() => {
        setSuccess("");
      }, 4000);
    }
  };

  // Update an existing item
  const updateItem = async (id, updatedItem) => {
    setLoading(true);
    try {
      const itemRef = doc(db, "items", id);
      await updateDoc(itemRef, updatedItem);
      setItems(
        items.map((item) => (item.id === id ? { id, ...updatedItem } : item))
      );
      setSuccess("Item updated successfully");
    } catch (error) {
      setLoading(false);
      console.error("Error updating item: ", error);
      setSuccess("Error updating item");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess("");
      }, 4000);
    }
  };

  // Delete an item
  const deleteItem = async (id) => {
    try {
      const itemRef = doc(db, "items", id);
      await deleteDoc(itemRef);
      setItems(items.filter((item) => item.id !== id));
      setSuccess("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item: ", error);
      setSuccess("Error deleting item");
    } finally {
      setInterval(() => {
        setSuccess("");
      }, 4000);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const value = {
    items,
    loading,
    success,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
  };

  return (
    <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
  );
};
