import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

// Servicios
import { supabase } from "../services/supabase";
import { RootStackParamList } from "../../App";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

const isValidEmail = (email: string) => /.+@.+/.test(email);

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados de imagen
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // 1. Seleccionar imagen y subirla inmediatamente
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Crucial para evitar los 0 bytes
    });

    if (!result.canceled && result.assets[0].base64) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      await uploadProfileImage(asset);
    }
  };

  // 2. Función de subida que SÍ envía datos (evita 0 bytes)
  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setLoading(true);
      const fileExt = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}.${fileExt}`;

      // Convertimos el base64 a un formato que Supabase Storage entienda bien
      const { data, error: uploadError } = await supabase.storage
        .from("avatard")
        .upload(fileName, decode(asset.base64!), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatard")
        .getPublicUrl(fileName);

      setProfileImageUrl(urlData.publicUrl);
    } catch (err: any) {
      console.error("Error subida:", err);
      Alert.alert("Error", "La imagen no se pudo subir al servidor.");
      setImageUri(null);
    } finally {
      setLoading(false);
    }
  };

  // 3. Registro final
  const handleRegister = async () => {
    setError("");
    if (!email || !username || !password || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Registrar en Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) throw signUpError;

      if (signUpData?.user) {
        // Insertar en la tabla profiles
        const { error: profileError } = await supabase.from("profiles").insert({
          id: signUpData.user.id,
          username: username,
          profile_image: profileImageUrl, // La URL que obtuvimos en el paso 2
        });

        if (profileError) throw profileError;

        Alert.alert("¡Éxito!", "Cuenta creada. Confirma tu email.");
        navigation.navigate("Login");
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Crea tu cuenta</Text>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickImage}
          disabled={loading}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Añadir foto</Text>
            </View>
          )}
          <View style={styles.miniBadge}>
            <Text style={{ color: "#FFF", fontSize: 12 }}>+</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.hintText}>Toca para subir una foto</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#94A3B8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#5CC2A3"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse ahora</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0F2F9", // Fondo gris azulado muy claro
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 40,
    alignItems: "center",
    // Sombra más profunda y estilizada
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo ultra oscuro
    marginBottom: 25,
    letterSpacing: -1,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
    padding: 4,
    borderRadius: 70,
    backgroundColor: "#EEF2FF", // Fondo suave para el avatar
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E7FF", // Indigo claro
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
  },
  miniBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#7C3AED", // Violeta Eléctrico
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    color: "#4338CA",
    fontSize: 12,
    fontWeight: "700",
  },
  hintText: {
    fontSize: 13,
    color: "#6366F1", // Indigo brillante
    marginBottom: 25,
    fontWeight: "600",
    opacity: 0.8,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    width: "100%",
    height: 60,
    backgroundColor: "#4F46E5", // Indigo Principal
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    // Sombra que brilla con el color del botón
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#DC2626", // Rojo intenso
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});
