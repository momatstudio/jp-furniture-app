import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/assets/styles";
import CustomAlert from "../../components/CustomAlert";
import { Redirect } from "expo-router";

function Login() {
  const { login, user, loading, setLoading, loginResult, setLoginResult } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInHandler = async () => {
    if (!email || !password) {
      setLoginResult("Please fill in all the input fields");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      setPassword("");
    } catch (error) {
      console.error(error);
    }
  };

  return user !== null ? (
    <Redirect href="(tabs)" />
  ) : (
    <View style={styles.container}>
      <View style={styles.container2}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
        <Text style={styles.text1}>Log in</Text>
      </View>
      <View></View>
      <View style={styles.inputGroup}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="abc@mail.com"
          style={styles.textInput}
        />
        <Text style={styles.text2}>Email address</Text>
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="*******************"
          style={styles.textInput}
        />
        <Text style={styles.text2}>Password</Text>
      </View>
      <CustomButton
        backgroundColor={colors.primary}
        label={
          loading ? (
            <ActivityIndicator size="40" color={colors.white} />
          ) : (
            "                                                Sign in                                                "
          )
        }
        onPress={signInHandler}
      />
      <Text>This app is confidential!</Text>
      {loginResult && <CustomAlert label={loginResult} color={colors.danger} />}
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  container2: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    width: "100%",
  },
  text1: {
    fontSize: 40,
    fontWeight: "900",
    paddingTop: 40,
    paddingBottom: 40,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 30,
  },
  textInput: {
    borderBottomWidth: 2,
    paddingVertical: 20,
  },
  text2: {
    fontWeight: "900",
    fontSize: 20,
  },
  text3: {
    paddingTop: 20,
    color: "red",
  },
});
