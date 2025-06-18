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
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData, type Card } from "../context/DataContext"
import TranslationSuggestions from "../components/TranslationSuggestions"

export default function AddEditCardScreen({ route, navigation }: any) {
  const { state, dispatch } = useData()
  const catalogId = route.params?.catalogId as string
  const card = route.params?.card as Card | undefined
  const prefilledWord = route.params?.prefilledWord as string | undefined
  const prefilledExample = route.params?.prefilledExample as string | undefined
  const isEditing = !!card

  const [englishWord, setEnglishWord] = useState(card?.englishWord || prefilledWord || "")
  const [russianTranslation, setRussianTranslation] = useState(card?.russianTranslation || "")
  const [examples, setExamples] = useState<string[]>(card?.examples || (prefilledExample ? [prefilledExample] : [""]))
  const [showEnglishSuggestions, setShowEnglishSuggestions] = useState(false)
  const [showRussianSuggestions, setShowRussianSuggestions] = useState(false)

  const catalog = state.catalogs.find((c) => c.id === catalogId)
  const cardsInCatalog = state.cards.filter((c) => c.catalogId === catalogId)

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Редактировать карточку" : "Новая карточка",
    })
  }, [isEditing, navigation])

  const addExample = () => {
    if (examples.length < 5) {
      setExamples([...examples, ""])
    }
  }

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples(examples.filter((_, i) => i !== index))
    }
  }

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples]
    newExamples[index] = value
    setExamples(newExamples)
  }

  const handleEnglishWordChange = (text: string) => {
    setEnglishWord(text)
    setShowEnglishSuggestions(text.length >= 2 && !russianTranslation.trim())
  }

  const handleRussianTranslationChange = (text: string) => {
    setRussianTranslation(text)
    setShowRussianSuggestions(text.length >= 2 && !englishWord.trim())
  }

  const handleEnglishSuggestionSelect = (suggestion: string) => {
    setRussianTranslation(suggestion)
    setShowEnglishSuggestions(false)
  }

  const handleRussianSuggestionSelect = (suggestion: string) => {
    setEnglishWord(suggestion)
    setShowRussianSuggestions(false)
  }

  const validateForm = () => {
    if (!englishWord.trim()) {
      Alert.alert("Ошибка", "Введите английское слово")
      return false
    }

    if (!russianTranslation.trim()) {
      Alert.alert("Ошибка", "Введите русский перевод")
      return false
    }

    // Проверка уникальности английского слова в каталоге
    const existingCard = cardsInCatalog.find(
      (c) => c.englishWord.toLowerCase() === englishWord.trim().toLowerCase() && c.id !== card?.id,
    )

    if (existingCard) {
      Alert.alert("Ошибка", "Слово уже существует в этом каталоге")
      return false
    }

    // Проверка примеров на содержание английского слова
    const filledExamples = examples.filter((ex) => ex.trim())
    for (const example of filledExamples) {
      if (!example.toLowerCase().includes(englishWord.toLowerCase())) {
        Alert.alert("Ошибка", `Пример "${example}" должен содержать слово "${englishWord}"`)
        return false
      }
    }

    return true
  }

  const handleSave = () => {
    if (!validateForm()) return

    const filledExamples = examples.filter((ex) => ex.trim())

    if (isEditing && card) {
      const updatedCard: Card = {
        ...card,
        englishWord: englishWord.trim(),
        russianTranslation: russianTranslation.trim(),
        examples: filledExamples,
      }
      dispatch({ type: "UPDATE_CARD", payload: updatedCard })
    } else {
      const newCard: Card = {
        id: Date.now().toString(),
        englishWord: englishWord.trim(),
        russianTranslation: russianTranslation.trim(),
        examples: filledExamples,
        catalogId,
        createdAt: new Date(),
      }
      dispatch({ type: "ADD_CARD", payload: newCard })
    }

    navigation.goBack()
  }

  if (!catalog) {
    return (
      <View style={styles.centerContainer}>
        <Text>Каталог не найден</Text>
      </View>
    )
  }

  const maxCardsReached = cardsInCatalog.length >= 50 && !isEditing

  if (maxCardsReached) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={64} color="#FF9500" />
        <Text style={styles.warningText}>Достигнут лимит</Text>
        <Text style={styles.warningSubtext}>В каталоге может быть максимум 50 карточек</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Основные поля */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Основная информация</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Английское слово *</Text>
              <TextInput
                style={styles.input}
                value={englishWord}
                onChangeText={handleEnglishWordChange}
                placeholder="Введите слово на английском"
                maxLength={50}
                autoCapitalize="none"
                autoFocus={!prefilledWord}
              />
              <Text style={styles.charCount}>{englishWord.length}/50</Text>

              <TranslationSuggestions
                text={englishWord}
                fromLanguage="en"
                toLanguage="ru"
                onSuggestionSelect={handleEnglishSuggestionSelect}
                visible={showEnglishSuggestions}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Русский перевод *</Text>
              <TextInput
                style={styles.input}
                value={russianTranslation}
                onChangeText={handleRussianTranslationChange}
                placeholder="Введите перевод на русском"
                maxLength={100}
                autoFocus={!!prefilledWord && !russianTranslation}
              />
              <Text style={styles.charCount}>{russianTranslation.length}/100</Text>

              <TranslationSuggestions
                text={russianTranslation}
                fromLanguage="ru"
                toLanguage="en"
                onSuggestionSelect={handleRussianSuggestionSelect}
                visible={showRussianSuggestions}
              />
            </View>
          </View>

          {/* Примеры */}
          <View style={styles.section}>
            <View style={styles.examplesHeader}>
              <Text style={styles.sectionTitle}>Примеры предложений</Text>
              <Text style={styles.examplesCount}>({examples.filter((ex) => ex.trim()).length}/5)</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Каждый пример должен содержать английское слово</Text>

            {examples.map((example, index) => (
              <View key={index} style={styles.exampleContainer}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleLabel}>Пример {index + 1}</Text>
                  {examples.length > 1 && (
                    <TouchableOpacity onPress={() => removeExample(index)} style={styles.removeButton}>
                      <Ionicons name="close-circle" size={20} color="#A62290" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.exampleInput}
                  value={example}
                  onChangeText={(value) => updateExample(index, value)}
                  placeholder={`Введите предложение с словом "${englishWord || "..."}" `}
                  maxLength={200}
                  multiline
                />
                <Text style={styles.charCount}>{example.length}/200</Text>
              </View>
            ))}

            {examples.length < 5 && (
              <TouchableOpacity style={styles.addExampleButton} onPress={addExample}>
                <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.addExampleText}>Добавить пример</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Кнопки */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{isEditing ? "Сохранить" : "Создать"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  examplesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  examplesCount: {
    fontSize: 14,
    color: "#0468B4",
    marginLeft: 8,
  },
  exampleContainer: {
    marginBottom: 16,
  },
  exampleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  removeButton: {
    padding: 4,
  },
  exampleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    minHeight: 60,
    textAlignVertical: "top",
  },
  addExampleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#0468B4",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addExampleText: {
    fontSize: 16,
    color: "#0468B4",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
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
  warningText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  warningSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#0468B4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
