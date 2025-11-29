import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { listarCodigos } from "../api";

export default function CodigosScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listarCodigos();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando códigos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await listarCodigos();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando códigos");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Códigos</Text>

      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: "crimson", marginBottom: 12 }}>{error}</Text>
      ) : items.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>No hay códigos todavía.</Text>
      ) : (
        <FlatList
          data={items}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb",
                marginBottom: 10, backgroundColor: "#fff",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "700" }}>{item.codigo}</Text>
                <View
                  style={{
                    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
                    backgroundColor: item.activo ? "#DCFCE7" : "#FEE2E2",
                  }}
                >
                  <Text style={{ fontSize: 12, color: item.activo ? "#166534" : "#991B1B" }}>
                    {item.activo ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>

              <Text style={{ color: "#374151", marginTop: 6 }}>
                Evaluado: {item.evaluado_nombre || "(sin nombre)"}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          marginTop: 12, alignSelf: "flex-start", backgroundColor: "#111827",
          borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
