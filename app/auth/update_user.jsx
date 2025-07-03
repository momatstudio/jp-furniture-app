import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScreenTitle from "@/components/ScreenTitle";
import { useAuth } from "../../context/AuthContext";
import { Redirect, router } from "expo-router";
import { colors, sizes, fontWeights, shadows } from "@/assets/styles";
import CustomAlert from "../../components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";

const UpdateUser = () => {
  const { user, logout, updateUser, loading, logginFailed, status } = useAuth();
  const [canEdit, setCanEdit] = useState(true);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState(user?.password || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

  const updateUserHandler = () => {
    const updatedUser = {
      displayName: displayName,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
      photoURL: photoURL,
    };
    updateUser(updatedUser);
  };

  if (!user) return <Redirect href={"/auth/login"} />;

  return (
    <KeyboardAvoidingView
      style={styles.modalKeyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <View style={styles.modalCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackBtn}
            accessibilityLabel="Back"
          >
            <Ionicons
              name={"arrow-back-outline"}
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Header showAlarmIcon={false} />
        </View>
        <ScreenTitle title="USER INFO" />
        {status && (
          <CustomAlert
            label={"User updated successfully!"}
            color={colors.success}
          />
        )}
        {logginFailed && (
          <CustomAlert
            label={
              "Update unsuccessful! Try again later with at least 6 characters password"
            }
            color={colors.danger}
          />
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardSection}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Full Names *</Text>
              <TextInput
                value={displayName}
                style={styles.input}
                placeholder={
                  user?.displayName ? user?.displayName : "Your full names"
                }
                editable={canEdit}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Full Names"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                value={email}
                style={styles.input}
                placeholder={user?.email ? user.email : "e.g info@mail.co.za"}
                keyboardType="email-address"
                editable={!canEdit}
                onChangeText={setEmail}
                autoCapitalize="none"
                returnKeyType="next"
                accessibilityLabel="Email"
              />
            </View>
            {/* <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Cell Number</Text>
              <TextInput
                value={phoneNumber}
                style={styles.input}
                placeholder="e.g. 0712345678"
                keyboardType="numeric"
                editable={canEdit}
                onChangeText={setPhoneNumber}
                accessibilityLabel="Cell Number"
              />
            </View> */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                value={password}
                style={styles.input}
                editable={canEdit}
                onChangeText={setPassword}
                secureTextEntry={true}
                placeholder="***********"
                accessibilityLabel="Password"
              />
            </View>
          </View>
          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={[
                styles.modalActionBtn,
                { backgroundColor: colors.success },
              ]}
              onPress={updateUserHandler}
              accessibilityLabel="Update"
              disabled={loading}
            >
              <Text style={styles.modalActionText}>
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  "Update"
                )}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalActionBtn,
                { backgroundColor: colors.danger },
              ]}
              onPress={logout}
              accessibilityLabel="Logout"
              disabled={loading}
            >
              <Text style={styles.modalActionText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UpdateUser;

const styles = StyleSheet.create({
  modalKeyboardAvoid: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  modalCard: {
    padding: sizes.padding,
    width: "96%",
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    borderRadius: sizes.radius + 6,
    backgroundColor: colors.card,
    ...shadows.modal,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sizes.s,
    marginTop: sizes.s,
  },
  headerBackBtn: {
    marginRight: sizes.s,
    padding: sizes.xs / 2,
  },
  modalScroll: {
    paddingBottom: sizes.xl,
  },
  cardSection: {
    backgroundColor: colors.secondary,
    borderRadius: sizes.radius,
    padding: sizes.s,
    marginBottom: sizes.m,
    marginTop: 4,
    elevation: 1,
  },
  inputRow: {
    marginBottom: sizes.s,
  },
  inputLabel: {
    fontWeight: fontWeights.medium,
    fontSize: sizes.sm,
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 2,
  },
  input: {
    paddingHorizontal: sizes.xs,
    fontSize: sizes.m,
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: sizes.radius - 4,
    minHeight: 44,
    borderWidth: sizes.border,
    borderColor: colors.lightGray,
    marginTop: 2,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: sizes.m,
    gap: 10,
  },
  modalActionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: sizes.radius - 2,
    marginHorizontal: 2,
  },
  modalActionText: {
    color: colors.white,
    fontWeight: fontWeights.bold,
    fontSize: sizes.m,
  },
});
