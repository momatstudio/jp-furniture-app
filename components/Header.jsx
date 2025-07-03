import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../assets/styles";
import { Link } from "expo-router";

const Header = ({ showAlarmIcon, showProfileButton, user }) => {
  const [initials, setInitials] = useState("");

  const userName = user ? user.displayName : "User";

  useEffect(() => {
    getInitials(userName);
  }, []);

  const getInitials = (name) => {
    if (!name) setInitials("?");

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      setInitials(parts[0].charAt(0).toUpperCase()); // Single name
    }

    setInitials(
      parts[0].charAt(0).toUpperCase() +
        parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.header2}>
        <Image
          source={require("../assets/images/WhatsApp_Image_2024-12-05_at_18.24.29_8e16d524-removebg-preview.png")}
          style={{ width: 40, height: 40 }}
        />
        <Text style={styles.title}>J.P Furniture</Text>
      </View>
      <View style={styles.header2}>
        {showAlarmIcon && (
          <Link href={"/reminder/reminder"} asChild>
            <TouchableOpacity>
              <Ionicons name="alarm" size={40} color={colors.primary} />
            </TouchableOpacity>
          </Link>
        )}

        {showProfileButton && (
          <Link href={"/auth/update_user"} asChild>
            <TouchableOpacity style={styles.profile}>
              <Text style={styles.text1}>{initials}</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    height: 70,
    width: "100%",
    // backgroundColor: "gray",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 10,
  },
  header2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  profile: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    // backgroundColor: "#000000",
    marginLeft: 5,
  },
  text1: {
    textAlign: "center",
    fontWeight: "bold",
    color: colors.primary,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "black",
    paddingLeft: 5,
    // width: 190,
  },
});
