import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Custom hook for AsyncStorage-backed state.
 * @param {string} key - The key to use in AsyncStorage.
 * @param {*} initialValue - The initial value to use if no value is in AsyncStorage.
 */
const useAsyncStorage = (key, initialValue) => {
  const [state, setState] = useState(initialValue);

  // Load the initial value from AsyncStorage
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          setState(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error(`Error loading value for key "${key}":`, error);
      }
    };

    loadValue();
  }, [key]);

  // Update AsyncStorage whenever the state changes
  const setPersistedState = useCallback(
    async (newValue) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(state) : newValue;
        setState(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving value for key "${key}":`, error);
      }
    },
    [key, state]
  );

  return [state, setPersistedState];
};

export default useAsyncStorage;
