import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../services/supabase";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = {
  route: RouteProp<RootStackParamList, "TourForm">;
  navigation: NativeStackNavigationProp<RootStackParamList, "TourForm">;
};

export default function TourFormScreen({ route, navigation }: Props) {
  const tourId = route.params?.tourId;
  const isEdit = !!tourId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchTour();
    }
  }, [tourId]);

  async function fetchTour() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tourId)
      .single();

    if (error || !data) {
      Alert.alert("Error", "No se pudo cargar el tour.");
      setLoading(false);
      return;
    }

    setTitle(data.title || "");
    setDescription(data.description || "");
    setCity(data.city || "");
    setLanguage(data.language || "");
    setCoverImage(data.cover_image || "");
    setDuration(data.duration?.toString() || "");
    setPrice(data.price?.toString() || "");
    setLoading(false);
  }

  const handleSave = async () => {
    if (!title.trim() || !city.trim() || !price.trim()) {
      Alert.alert(
        "Error",
        "Completa los campos obligatorios: Título, Ciudad y Precio.",
      );
      return;
    }

    const priceNum = parseFloat(price);
    const durationNum = duration.trim() ? parseInt(duration) : 0;

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Error", "El precio debe ser un número mayor que 0.");
      return;
    }

    setLoading(true);

    try {
      const tourData: any = {
        title: title.trim(),
        description: description.trim(),
        city: city.trim(),
        language: language.trim() || "Español",
        cover_image: coverImage.trim() || null,
        duration: durationNum,
        price: priceNum,
      };

      let error;

      if (isEdit) {
        // Actualizar (no tocamos created_by)
        ({ error } = await supabase
          .from("tours")
          .update(tourData)
          .eq("id", tourId));
      } else {
        // Crear nuevo
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No se encontró usuario autenticado");

        ({ error } = await supabase
          .from("tours")
          .insert([{ ...tourData, created_by: user.id }]));
      }

      if (error) throw error;

      Alert.alert(
        "¡Éxito!",
        isEdit ? "Tour actualizado correctamente" : "Tour creado correctamente",
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo guardar el tour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            {isEdit ? "Editar Tour" : "Nuevo Tour"}
          </Text>
          <Text style={styles.subtitle}>
            {isEdit
              ? "Modifica los detalles de tu aventura"
              : "Cuéntanos los detalles de tu aventura"}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título del Tour *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Caminata por el centro histórico"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Describe la experiencia..."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Sevilla"
                placeholderTextColor="#94A3B8"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Idioma</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Español"
                placeholderTextColor="#94A3B8"
                value={language}
                onChangeText={setLanguage}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Precio (€) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 25"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Duración (min)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 120"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL Imagen de Portada</Text>
            <TextInput
              style={styles.input}
              placeholder="https://ejemplo.com/imagen.jpg"
              placeholderTextColor="#94A3B8"
              value={coverImage}
              onChangeText={setCoverImage}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEdit ? "Guardar Cambios" : "Crear Aventura"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar y salir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F9", // Fondo Indigo claro
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo oscuro
    textAlign: "center",
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6366F1", // Indigo brillante
    textAlign: "center",
    marginTop: 6,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 28,
    // Sombra Indigo estilizada
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4338CA", // Indigo intermedio
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#4F46E5", // Indigo Principal
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  disabledButton: {
    backgroundColor: "#C7D2FE",
    shadowOpacity: 0.1,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#94A3B8", // Gris azulado para neutralizar
    fontWeight: "600",
    fontSize: 15,
  },
});
