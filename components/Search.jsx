import { View, Text, StyleSheet, TextInput } from "react-native";
import React from "react";

const Search = ({ placeholder, value, onChangeText }) => {
  // return <TextInput style={styles.search} placeholder="Search here" />;
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  // searchContainer: {
  //   borderColor: colors.secondary,
  //   borderBottomWidth: 1,
  //   marginBottom: 20,
  //   width: "100%",
  // },

  searchContainer: {
    marginBottom: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    justifyContent: "center",
    width: "100%",
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
});
