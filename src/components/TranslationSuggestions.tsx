"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { translateService, type TranslationSuggestion } from "../services/translateService"

interface TranslationSuggestionsProps {
  text: string
  fromLanguage: "en" | "ru"
  toLanguage: "en" | "ru"
  onSuggestionSelect: (suggestion: string) => void
  visible: boolean
}

export default function TranslationSuggestions({
  text,
  fromLanguage,
  toLanguage,
  onSuggestionSelect,
  visible,
}: TranslationSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TranslationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible || !text.trim() || text.length < 2) {
      setSuggestions([])
      setError(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const results = await translateService.getTranslationSuggestions(text, fromLanguage, toLanguage)
        setSuggestions(results)

        if (results.length === 0) {
          setError("Переводы не найдены")
        }
      } catch (err) {
        console.error("Translation suggestions error:", err)
        setError("Ошибка получения переводов")
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 500) // Дебаунс 500мс

    return () => clearTimeout(timeoutId)
  }, [text, fromLanguage, toLanguage, visible])

  if (!visible) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="language" size={16} color="#0468B4" />
        <Text style={styles.headerText}>Варианты перевода</Text>
        {loading && <ActivityIndicator size="small" color="#0468B4" style={styles.headerLoader} />}
      </View>

      {loading && suggestions.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Получение переводов...</Text>
        </View>
      )}

      {error && suggestions.length === 0 && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#A62290" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSuggestionSelect(suggestion.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              {suggestion.confidence && suggestion.confidence < 1.0 && (
                <View style={styles.alternativeIndicator}>
                  <Text style={styles.alternativeText}>вариант</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#B0C7E620",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0468B4",
    marginLeft: 6,
    flex: 1,
  },
  headerLoader: {
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 8,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#A62290",
    marginLeft: 6,
    fontStyle: "italic",
  },
  suggestionsContainer: {
    gap: 6,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  suggestionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  alternativeIndicator: {
    backgroundColor: "#B0C7E620",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alternativeText: {
    fontSize: 10,
    color: "#0468B4",
    fontWeight: "500",
  },
})
