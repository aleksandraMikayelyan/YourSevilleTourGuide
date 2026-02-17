import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../services/supabase";
import { RootStackParamList } from "../../App";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigation.replace("Tours");
      }
    } catch (err) {
      console.log("Error al verificar sesión:", err);
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor completa ambos campos");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
        Alert.alert("Error al iniciar sesión", error.message);
        return;
      }

      Alert.alert("¡Bienvenido!", "Has iniciado sesión correctamente");
      navigation.replace("Tours");
    } catch (err: any) {
      console.error("Excepción en login:", err);
      setErrorMessage("Ocurrió un error inesperado. Intenta de nuevo.");
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Iniciar Sesión</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>
            Ingresa tus credenciales para continuar
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4F46E5"
              style={{ marginTop: 20 }}
            />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.registerLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0F2F9",
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: "#6366F1",
    fontWeight: "600",
    marginBottom: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1E1B4B",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 30,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4338CA",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    height: 58,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#111827",
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  registerButton: {
    marginTop: 25,
    alignItems: "center",
  },
  registerText: {
    color: "#64748B",
    fontSize: 15,
  },
  registerLink: {
    color: "#7C3AED",
    fontWeight: "800",
  },
  errorBox: {
    backgroundColor: "#FFF1F1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
