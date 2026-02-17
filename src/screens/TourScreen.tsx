import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Tour = {
  id: string;
  title: string;
  city: string;
  language: string;
  cover_image?: string;
  duration: number;
  price: number;
  created_by: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Tours">;
};

export default function ToursScreen({ navigation }: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const drawerNavigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
        await fetchTours();
      };
      init();
    }, []),
  );

  async function fetchTours() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tours")
      .select(
        "id, title, city, language, cover_image, duration, price, created_by",
      )
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "No se pudieron cargar los tours: " + error.message);
    } else if (data) {
      setTours(data);
    }
    setLoading(false);
  }

  // ────────────────────────────────────────────────
  // FUNCIÓN PARA ELIMINAR TOUR
  // ────────────────────────────────────────────────
  const deleteTour = (tourId: string, tourTitle: string) => {
    Alert.alert(
      "Eliminar Tour",
      `¿Estás seguro de que deseas eliminar "${tourTitle}"?\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("tours")
                .delete()
                .eq("id", tourId);

              if (error) throw error;

              Alert.alert("Éxito", "El tour ha sido eliminado correctamente.");
              fetchTours(); // Refresca la lista
            } catch (err: any) {
              console.error("Error al eliminar tour:", err);
              Alert.alert(
                "Error",
                err.message || "No se pudo eliminar el tour. Intenta de nuevo.",
              );
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error al cerrar sesión", error.message);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const openChatDrawer = () => {
    drawerNavigation.getParent()?.openDrawer();
  };

  const renderTour = ({ item }: { item: Tour }) => {
    const isOwner = item.created_by === currentUserId;

    return (
      <View style={styles.card}>
        {item.cover_image ? (
          <Image source={{ uri: item.cover_image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.price}€</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.tourTitle}>{item.title}</Text>
          <Text style={styles.locationText}>
            {item.city} · {item.duration} min · {item.language || "Español"}
          </Text>

          <TouchableOpacity
            style={styles.viewMapBtn}
            onPress={() =>
              navigation.navigate("MapaDetallado", {
                tourId: item.id,
                tourTitle: item.title,
              })
            }
          >
            <Text style={styles.viewMapBtnText}>ABRIR MAPA Y AUDIO</Text>
          </TouchableOpacity>

          {isOwner && (
            <View style={styles.ownerActionsRow}>
              <TouchableOpacity
                style={styles.addStopBtn}
                onPress={() =>
                  navigation.navigate("EditStops", { tourId: item.id })
                }
              >
                <Text style={styles.addStopBtnText}>+ Parada</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate("TourForm", { tourId: item.id })
                }
              >
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>

              {/* NUEVO BOTÓN ELIMINAR */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteTour(item.id, item.title)}
              >
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mis Aventuras</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="person-outline" size={24} color="#2D5A4C" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FF7675" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("TourForm")}
        >
          <Text style={styles.buttonText}>+ Nuevo Tour</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5CC2A3" style={{ flex: 1 }} />
      ) : tours.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no tienes aventuras creadas</Text>
        </View>
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id}
          renderItem={renderTour}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.chatButton} onPress={openChatDrawer}>
        <Text style={styles.chatButtonText}>💬</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F0F2F9", // Fondo Indigo claro
  },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo oscuro
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#EEF2FF",
  },
  createButton: {
    backgroundColor: "#4F46E5", // Indigo principal
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginBottom: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#1E1B4B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#E0E7FF",
  },
  priceBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#7C3AED", // Violeta eléctrico
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 5,
  },
  priceText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  infoContainer: {
    padding: 20,
  },
  tourTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E1B4B",
    marginBottom: 8,
  },
  locationText: {
    color: "#6366F1", // Indigo brillante
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 15,
  },
  viewMapBtn: {
    backgroundColor: "#1E1B4B", // Fondo oscuro premium
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 10,
  },
  viewMapBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1.2,
  },
  ownerActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1.5,
    borderTopColor: "#F1F5F9",
    gap: 10,
  },
  addStopBtn: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addStopBtnText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 13,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    color: "#7C3AED",
    fontWeight: "800",
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FFF1F1",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 13,
  },
  chatButton: {
    position: "absolute",
    bottom: 30,
    right: 30, // Movido a la derecha para no tapar contenido importante
    backgroundColor: "#4F46E5",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  chatButtonText: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#94A3B8",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
