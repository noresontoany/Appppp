"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useData, type Catalog } from "../context/DataContext"

export default function AddEditCatalogScreen({ route, navigation }: any) {
  const { state, dispatch } = useData()
  const catalog = route.params?.catalog as Catalog | undefined
  const isEditing = !!catalog

  const [name, setName] = useState(catalog?.name || "")

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Редактировать каталог" : "Новый каталог",
    })
  }, [isEditing, navigation])

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Ошибка", "Введите название каталога")
      return
    }

    // Проверка уникальности названия
    const existingCatalog = state.catalogs.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== catalog?.id,
    )

    if (existingCatalog) {
      Alert.alert("Ошибка", "Каталог с таким названием уже существует")
      return
    }

    if (isEditing && catalog) {
      const updatedCatalog: Catalog = {
        ...catalog,
        name: name.trim(),
      }
      dispatch({ type: "UPDATE_CATALOG", payload: updatedCatalog })
    } else {
      const newCatalog: Catalog = {
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: new Date(),
        statistics: {
          englishToRussian: 0,
          russianToEnglish: 0,
        },
      }
      dispatch({ type: "ADD_CATALOG", payload: newCatalog })
    }

    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Название каталога *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Введите название каталога"
            placeholderTextColor="#B0C7E6"
            maxLength={50}
            autoFocus
          />
          <Text style={styles.charCount}>{name.length}/50</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isEditing ? "Сохранить" : "Создать"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
  },
  saveButton: {
    backgroundColor: "#0468B4",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
})
