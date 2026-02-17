import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabase";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Stop = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  stop_order: number;
};

type Props = {
  route: RouteProp<RootStackParamList, "EditStops">;
  navigation: NativeStackNavigationProp<RootStackParamList, "EditStops">;
};

export default function EditStopsScreen({ route, navigation }: Props) {
  const { tourId } = route.params;
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  // Refresca la lista cada vez que volvemos a esta pantalla (después de crear/editar parada)
  useFocusEffect(
    useCallback(() => {
      fetchStops();
    }, [tourId]),
  );

  async function fetchStops() {
    setLoading(true);
    const { data, error } = await supabase
      .from("stops")
      .select("*")
      .eq("tour_id", tourId)
      .order("stop_order", { ascending: true });

    if (error) {
      Alert.alert("Error", "No se pudieron cargar las paradas.");
    } else if (data) {
      setStops(data);
    }
    setLoading(false);
  }

  async function deleteStop(stopId: string) {
    Alert.alert(
      "Eliminar parada",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("stops")
              .delete()
              .eq("id", stopId);

            if (error) {
              Alert.alert("Error", error.message); // ← muestra el mensaje real (RLS, etc.)
            } else {
              fetchStops();
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestionar Paradas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("StopForm", { tourId })}
        >
          <Text style={styles.addBtnText}>+ Añadir Nueva Parada</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5CC2A3" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={stops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderText}>{item.stop_order}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stopTitle}>{item.title}</Text>
                  <Text style={styles.coordsText}>
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("StopForm", { tourId, stopId: item.id })
                  }
                >
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteStop(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Aún no has añadido paradas a este tour.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F0F2F9", // Indigo muy claro
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo profundo
    marginBottom: 20,
    letterSpacing: -1,
  },
  addBtn: {
    backgroundColor: "#4F46E5", // Indigo principal
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginBottom: 18,
    padding: 20,
    elevation: 6,
    shadowColor: "#1E1B4B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  orderBadge: {
    backgroundColor: "#EEF2FF", // Fondo indigo suave
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    borderWidth: 1.5,
    borderColor: "#C7D2FE",
  },
  orderText: {
    color: "#4F46E5",
    fontWeight: "900",
    fontSize: 20,
  },
  stopTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  coordsText: {
    color: "#6366F1",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderTopColor: "#F1F5F9",
    paddingTop: 15,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F5F3FF", // Violeta muy suave
    borderRadius: 14,
  },
  editBtnText: {
    color: "#7C3AED", // Violeta fuerte
    fontWeight: "800",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFF1F1", // Rojo suave
    borderRadius: 14,
  },
  deleteBtnText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});
