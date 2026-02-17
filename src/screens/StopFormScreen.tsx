import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../services/supabase";
import { RootStackParamList } from "../../App";

type Props = {
  route: RouteProp<RootStackParamList, "StopForm">;
  navigation: NativeStackNavigationProp<RootStackParamList, "StopForm">;
};

export default function StopFormScreen({ route, navigation }: Props) {
  const { tourId, stopId } = route.params;
  const isEdit = !!stopId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEdit) fetchStop();
  }, [stopId]);

  async function fetchStop() {
    const { data, error } = await supabase
      .from("stops")
      .select("*")
      .eq("id", stopId)
      .single();

    if (error || !data) {
      Alert.alert("Error", "No se pudo cargar la parada.");
      return;
    }

    setTitle(data.title);
    setDescription(data.description || "");
    setOrder(data.stop_order.toString());
    setCoord({ lat: data.latitude, lng: data.longitude });
  }

  const saveStop = async () => {
    if (!title.trim()) return Alert.alert("Error", "El título es obligatorio.");
    if (!coord)
      return Alert.alert(
        "Error",
        "Toca el mapa para seleccionar la ubicación.",
      );
    if (!order.trim())
      return Alert.alert("Error", "El orden de la parada es obligatorio.");

    setSaving(true);

    const stopData = {
      tour_id: tourId,
      title: title.trim(),
      description: description.trim(),
      latitude: coord.lat,
      longitude: coord.lng,
      stop_order: parseInt(order),
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase
        .from("stops")
        .update(stopData)
        .eq("id", stopId));
    } else {
      ({ error } = await supabase.from("stops").insert(stopData));
    }

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "¡Éxito!",
        isEdit
          ? "Parada actualizada correctamente"
          : "Parada creada correctamente",
      );
      navigation.goBack(); // EditStops se refrescará automáticamente
    }
  };

  const initialRegion = coord
    ? {
        latitude: coord.lat,
        longitude: coord.lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }
    : {
        latitude: 37.3891, // Sevilla por defecto
        longitude: -5.9845,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={styles.mainTitle}>
          {isEdit ? "Editar Parada" : "Nueva Parada"}
        </Text>

        <Text style={styles.label}>Nombre del Monumento</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Torre del Oro"
          placeholderTextColor="#A0A0A0"
        />

        <Text style={styles.label}>Historia para la Audioguía</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Escribe aquí lo que la voz leerá..."
        />

        <Text style={styles.label}>Orden de la parada</Text>
        <TextInput
          style={styles.input}
          value={order}
          onChangeText={setOrder}
          keyboardType="numeric"
          placeholder="Ej: 3"
        />

        <Text style={styles.label}>
          Ubicación (toca el mapa para mover el marcador)
        </Text>
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.miniMap}
            initialRegion={initialRegion}
            onPress={(e) =>
              setCoord({
                lat: e.nativeEvent.coordinate.latitude,
                lng: e.nativeEvent.coordinate.longitude,
              })
            }
          >
            {coord && (
              <Marker
                coordinate={{ latitude: coord.lat, longitude: coord.lng }}
                pinColor="#5CC2A3"
              />
            )}
          </MapView>
        </View>

        {coord && (
          <Text style={styles.coordsInfo}>
            📍 {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={saveStop}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? "ACTUALIZAR PARADA" : "GUARDAR PARADA"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F9", // Fondo Indigo claro
    padding: 25,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo oscuro
    marginBottom: 25,
    marginTop: 40,
    textAlign: "center",
    letterSpacing: -1.5,
  },
  label: {
    fontWeight: "800",
    color: "#4338CA", // Indigo intermedio
    marginBottom: 10,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    fontSize: 16,
    color: "#1E1B4B",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    // Sombra sutil para los inputs
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  textArea: {
    height: 150, // Un poco más alto para mejor redacción
    textAlignVertical: "top",
    lineHeight: 22,
  },
  mapWrapper: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "white",
    elevation: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  miniMap: {
    width: "100%",
    height: 260,
  },
  coordsInfo: {
    textAlign: "center",
    color: "#6366F1", // Indigo brillante
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 30,
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "center",
    paddingHorizontal: 15,
  },
  saveBtn: {
    backgroundColor: "#4F46E5", // Indigo Principal
    padding: 20,
    borderRadius: 22,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 10,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1.5,
  },
});
