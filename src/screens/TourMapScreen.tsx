import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import * as Speech from "expo-speech";
import { supabase } from "../services/supabase";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { generateAndShareTourPDF } from "../utils/PdfUtils"; // Ajusta la ruta si es necesario

type Stop = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  stop_order: number;
};

type TourMapProps = {
  route: RouteProp<RootStackParamList, "MapaDetallado">;
};

export default function TourMapScreen({ route }: TourMapProps) {
  const { tourId, tourTitle } = route.params;
  const mapRef = useRef<MapView>(null);

  const [stops, setStops] = useState<Stop[]>([]);
  const [tourCoverImage, setTourCoverImage] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);

  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(false);
  const currentIdxRef = useRef(0);

  useEffect(() => {
    fetchStops();
    fetchTourCover();
    return () => {
      Speech.stop();
    };
  }, [tourId]);

  const fetchStops = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stops")
      .select("id, title, description, latitude, longitude, stop_order")
      .eq("tour_id", tourId)
      .order("stop_order", { ascending: true });

    if (error) {
      Alert.alert("Error", "No se pudieron cargar las paradas");
      setLoading(false);
      return;
    }

    if (data) {
      const parsed = data
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description || "",
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          stop_order: Number(s.stop_order) || 0,
        }))
        .filter((s) => !isNaN(s.latitude) && !isNaN(s.longitude));

      setStops(parsed);

      if (parsed.length > 0 && mapRef.current) {
        const coords = parsed.map((s) => ({
          latitude: s.latitude,
          longitude: s.longitude,
        }));
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 80, right: 80, bottom: 300, left: 80 },
            animated: true,
          });
        }, 800);
      }
    }
    setLoading(false);
  }, [tourId]);

  // Nuevo: Obtener la imagen de portada del tour
  const fetchTourCover = useCallback(async () => {
    const { data, error } = await supabase
      .from("tours")
      .select("cover_image")
      .eq("id", tourId)
      .single();

    if (error) {
      console.log("Error fetching tour cover:", error);
      return;
    }

    if (data?.cover_image) {
      setTourCoverImage(data.cover_image);
    }
  }, [tourId]);

  const playFrom = useCallback((array: string[], index: number) => {
    if (index >= array.length || isPausedRef.current) {
      if (index >= array.length) setIsSpeaking(false);
      return;
    }

    setCurrentIdx(index);
    currentIdxRef.current = index;

    Speech.speak(array[index].trim(), {
      language: "es-ES",
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        if (!isPausedRef.current) playFrom(array, index + 1);
      },
      onError: (err) => {
        console.log("Speech error:", err);
        Alert.alert(
          "Error de voz",
          "No se pudo reproducir. Verifica volumen o modo silencio.",
        );
        setIsSpeaking(false);
      },
    });
  }, []);

  const handleSelectStop = (stop: Stop) => {
    Speech.stop();
    setSelectedStop(stop);

    const fullText = stop.description?.trim() || "Sin descripción disponible.";
    const chunks = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];

    const cleanChunks = chunks.map((c) => c.trim()).filter((c) => c.length > 0);

    setSentences(cleanChunks);
    setCurrentIdx(0);
    currentIdxRef.current = 0;
    setIsSpeaking(true);
    setIsPaused(false);
    isPausedRef.current = false;

    const initialText = `${stop.title}. ${cleanChunks[0] || ""}`;
    Speech.speak(initialText, {
      language: "es-ES",
      onDone: () => {
        if (cleanChunks.length > 1 && !isPausedRef.current) {
          playFrom(cleanChunks.slice(1), 1);
        } else {
          setIsSpeaking(false);
        }
      },
      onError: (err) => {
        console.log(err);
        Alert.alert(
          "Error",
          "No se pudo reproducir el audio. Verifica ajustes de voz.",
        );
      },
    });
  };

  const togglePlayback = () => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      playFrom(sentences, currentIdxRef.current);
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      Speech.pause();
    }
  };

  const stopPlayback = () => {
    Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setSelectedStop(null);
    setSentences([]);
    setCurrentIdx(0);
  };

  const initialRegion: Region = {
    latitude: 37.3891,
    longitude: -5.9845,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CC2A3" />
      </View>
    );
  }

  if (stops.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No hay paradas en este tour</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>{tourTitle || "Tour Map"}</Text>

      {/* Botón PDF - ahora pasa la cover_image */}
      <TouchableOpacity
        style={styles.pdfButton}
        onPress={() =>
          generateAndShareTourPDF(tourTitle, stops, tourCoverImage)
        }
        disabled={loading || stops.length === 0}
      >
        <Text style={styles.pdfButtonText}>Generar Informe PDF</Text>
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
      >
        <Polyline
          coordinates={stops.map((s) => ({
            latitude: s.latitude,
            longitude: s.longitude,
          }))}
          strokeColor="#5CC2A3"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />

        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            onPress={() => handleSelectStop(stop)}
          >
            <View
              style={[
                styles.marker,
                selectedStop?.id === stop.id && styles.markerActive,
              ]}
            >
              <Text style={styles.markerText}>{stop.stop_order}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedStop && (
        <View style={styles.audioPanel}>
          <Text style={styles.audioTitle}>{selectedStop.title}</Text>

          <ScrollView
            style={styles.historyScroll}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.historyText}>
              {sentences.map((sentence, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.sentenceBase,
                    idx === currentIdx && isSpeaking && !isPaused
                      ? styles.sentenceActive
                      : styles.sentenceInactive,
                  ]}
                >
                  {sentence.trim()}{" "}
                </Text>
              ))}
            </Text>
          </ScrollView>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.stopBtn} onPress={stopPlayback}>
              <Text style={styles.controlIcon}>⏹</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playBtn} onPress={togglePlayback}>
              <Text style={styles.playText}>
                {isPaused ? "REANUDAR" : isSpeaking ? "PAUSAR" : "REPRODUCIR"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F9",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E1B4B", // Indigo oscuro
    textAlign: "center",
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    letterSpacing: -0.5,
  },

  // Botón PDF Refinado
  pdfButton: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "#7C3AED", // Violeta eléctrico
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  pdfButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F9",
  },
  emptyText: {
    fontSize: 18,
    color: "#6366F1",
    fontWeight: "600",
    textAlign: "center",
  },

  // Marcadores con estilo moderno
  marker: {
    backgroundColor: "#4F46E5", // Indigo principal
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4,
  },
  markerActive: {
    backgroundColor: "#7C3AED", // Cambia a Violeta cuando se selecciona
    transform: [{ scale: 1.3 }],
    borderColor: "#F0F2F9",
    borderWidth: 4,
  },
  markerText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  // Panel de Audio "Premium Card"
  audioPanel: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    maxHeight: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    padding: 24,
    elevation: 20,
    shadowColor: "#1E1B4B",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
  },
  audioTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E1B4B",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  historyScroll: {
    maxHeight: 140,
    marginBottom: 20,
    backgroundColor: "#F8FAFC", // Fondo suave para el texto
    borderRadius: 20,
    padding: 12,
  },
  historyText: {
    lineHeight: 26,
    fontSize: 16,
  },
  sentenceBase: {
    color: "#94A3B8",
  },
  sentenceActive: {
    color: "#4F46E5", // Indigo resalta el texto que suena
    fontWeight: "800",
    backgroundColor: "#EEF2FF",
  },
  sentenceInactive: {
    color: "#64748B",
  },

  // Controles tipo Reproductor de Música
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  stopBtn: {
    backgroundColor: "#FFF1F1", // Fondo rojo pálido
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  playBtn: {
    flex: 1,
    backgroundColor: "#4F46E5", // Indigo principal
    height: 65,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  playText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 1.2,
  },
  controlIcon: {
    fontSize: 24,
    color: "#EF4444", // Ícono de stop en rojo
  },
});
