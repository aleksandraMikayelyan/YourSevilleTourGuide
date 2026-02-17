import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
          // IMPORTANTE: Si existe la URL, forzamos la recarga con un timestamp
          if (data.profile_image) {
            setImageUrl(`${data.profile_image}?t=${new Date().getTime()}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error cargando perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Formato moderno para evitar warnings
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir la galería");
    }
  };

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      // Creamos un nombre único basado en el ID del usuario
      const fileExt = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}.${fileExt}`;

      // 1. Preparamos el FormData (Es el método más seguro en React Native)
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      // 2. SUBIDA AL STORAGE (Usamos UPSERT para que reemplace el archivo anterior)
      const { error: uploadError } = await supabase.storage
        .from("avatard")
        .upload(fileName, formData, {
          cacheControl: "3600",
          upsert: true, // Esto es el "Update" del archivo
        });

      if (uploadError) throw uploadError;

      // 3. OBTENEMOS URL PÚBLICA
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatard").getPublicUrl(fileName);

      // 4. UPDATE EN LA TABLA PROFILES
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ profile_image: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // 5. ACTUALIZAMOS ESTADO LOCAL
      setImageUrl(`${publicUrl}?t=${new Date().getTime()}`);
      Alert.alert("¡Éxito!", "Imagen de perfil actualizada correctamente.");
    } catch (err: any) {
      console.error("DEBUG ERROR:", err);
      Alert.alert("Error", err.message || "No se pudo actualizar la imagen");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#5CC2A3" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleEditAvatar}
          style={styles.imageContainer}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>
                {profile?.username
                  ? profile.username.charAt(0).toUpperCase()
                  : "?"}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>EDITAR</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>{profile?.username || "Usuario"}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID ÚNICO:</Text>
          <Text style={styles.infoValue}>{profile?.id || "No disponible"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F9", // Fondo Indigo claro
    justifyContent: "center",
    padding: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 35,
    alignItems: "center",
    // Sombra premium Indigo
    elevation: 12,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.12,
    shadowRadius: 25,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 25,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: "#EEF2FF", // Borde suave
  },
  placeholderAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#4F46E5", // Indigo principal
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#EEF2FF",
  },
  placeholderText: {
    fontSize: 70,
    color: "#FFF",
    fontWeight: "900",
    letterSpacing: -2,
  },
  editBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#7C3AED", // Violeta eléctrico
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    elevation: 5,
  },
  editBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo oscuro
    marginBottom: 25,
    letterSpacing: -1,
  },
  infoRow: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoLabel: {
    color: "#6366F1", // Indigo brillante
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
});
