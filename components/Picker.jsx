import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { useOrders } from "../context/OrdersContext";
import { colors } from "@/assets/styles";

const Picker = ({ setSelectedItem, label = "Select Furniture", error }) => {
  const { items } = useOrders();
  const [selectedValue, setSelectedValue] = useState("");
  const [pickerItems, setPickerItems] = useState([]);

  useEffect(() => {
    const formatted = items.map((item) => ({
      label: `${item.name} - R${item.price}`,
      value: item.id,
      itemObj: {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl ?? "",
        title: item.name,
      },
    }));
    setPickerItems(formatted);

    // Only reset if items changed in a way that requires reset (e.g., items list is empty)
    if (formatted.length === 0) {
      setSelectedValue("");
      setSelectedItem(null);
    }
  }, [items, setSelectedItem]);

  const handleChange = (value) => {
    setSelectedValue(value);
    const found = pickerItems.find((i) => i.value === value);
    setSelectedItem(found ? found.itemObj : null);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.pickerContainer, error && styles.pickerError]}
        accessible
        accessibilityLabel={label}
      >
        <RNPicker
          selectedValue={selectedValue}
          onValueChange={handleChange}
          style={styles.picker}
          dropdownIconColor={colors.primary}
          mode="dropdown"
        >
          <RNPicker.Item
            label="Select an item..."
            value=""
            color={colors.gray}
          />
          {pickerItems.map((item) => (
            <RNPicker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              color={colors.black}
            />
          ))}
        </RNPicker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
    color: colors.primary,
    marginLeft: 2,
  },
  pickerContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: 2,
    marginBottom: 2,
    overflow: "hidden",
    minHeight: 48,
    justifyContent: "center",
  },
  picker: {
    height: 48,
    color: colors.black,
    backgroundColor: colors.secondary,
    width: "100%",
  },
  pickerError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 2,
  },
});

export default Picker;
