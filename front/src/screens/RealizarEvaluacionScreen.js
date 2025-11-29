import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { guardarRespuestas, finalizarSesion } from "../api";

export default function RealizarEvaluacionScreen({ route, navigation }) {
  const { token_sesion, evaluado_nombre, preguntas } = route.params || {};
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const totalRespondidas = useMemo(() => Object.keys(values).length, [values]);

  const onSelect = (pregunta_id, valor) => {
    setValues((prev) => ({ ...prev, [pregunta_id]: valor }));
  };

  const navegarALogin = () => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  // si falla el guardado muestra un mensaje de error
  const onSubmit = async () => {
    if (!token_sesion) {
      if (Platform.OS === "web") {
        alert("Error: Sesión inválida.");
      } else {
        Alert.alert("Error", "Sesión inválida.");
      }
      return;
    }

    const respuestas = Object.entries(values).map(([pregunta_id, valor]) => ({
      pregunta_id: Number(pregunta_id),
      valor: Number(valor),
    }));
    if (respuestas.length === 0) {
      if (Platform.OS === "web") {
        alert("Sin respuestas: selecciona al menos una opción.");
      } else {
        Alert.alert("Sin respuestas", "Selecciona al menos una opción.");
      }
      return;
    }

    setSubmitting(true);
    try {
      await guardarRespuestas(token_sesion, respuestas);
      await finalizarSesion(token_sesion);

      if (Platform.OS === "web") {
        alert("Gracias: respuestas enviadas correctamente.");
        navegarALogin();
      } else {
        Alert.alert("Gracias", "Respuestas enviadas correctamente.", [
          { text: "OK", onPress: navegarALogin },
        ]);
      }
    } catch (e) {
      const msg = e?.message || "No se pudo enviar la evaluación.";
      if (Platform.OS === "web") {
        alert(`Error: ${msg}`);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Cuestionario</Text>
      <Text style={{ color: "#374151" }}>
        Evaluado: <Text style={{ fontWeight: "700" }}>{evaluado_nombre || "(sin nombre)"}</Text>
      </Text>
      <Text style={{ color: "#6b7280" }}>Responde (1 = bajo, 5 = alto)</Text>

      {(preguntas || []).map((p) => (
        <View
          key={p.id}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            backgroundColor: "#fff",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>
            {p.texto} <Text style={{ color: "#6b7280" }}>[{p.dimension}]</Text>
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((v) => {
              const active = values[p.id] === v;
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => onSelect(p.id, v)}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? "#2563eb" : "#e5e7eb",
                    backgroundColor: active ? "#DBEAFE" : "#fff",
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontWeight: "700", color: active ? "#1d4ed8" : "#111827" }}>{v}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={submitting}
        style={{
          backgroundColor: "#2563eb",
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: "center",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>Guardar y enviar</Text>
        )}
      </TouchableOpacity>

      <Text style={{ color: "#6b7280", marginTop: 6 }}>
        Preguntas respondidas: {totalRespondidas} / {(preguntas || []).length}
      </Text>
    </View>
  );
}
