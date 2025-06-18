"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData, type Card, type Catalog } from "../context/DataContext"

export default function StudySessionScreen({ route, navigation }: any) {
  const { dispatch } = useData()
  const { catalog, cards, studyMode } = route.params as {
    catalog: Catalog
    cards: Card[]
    studyMode: "englishToRussian" | "russianToEnglish"
  }

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [shuffledCards, setShuffledCards] = useState<Card[]>([])
  const [showExamples, setShowExamples] = useState(false)

  useEffect(() => {
    // Перемешиваем карточки в случайном порядке
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
  }, [cards])

  useEffect(() => {
    navigation.setOptions({
      title: `${catalog.name} (${currentCardIndex + 1}/${shuffledCards.length})`,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            Alert.alert("Завершить изучение?", "Прогресс не будет сохранен", [
              { text: "Продолжить", style: "cancel" },
              { text: "Завершить", style: "destructive", onPress: () => navigation.goBack() },
            ])
          }}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      ),
    })
  }, [navigation, catalog.name, currentCardIndex, shuffledCards.length])

  const currentCard = shuffledCards[currentCardIndex]

  if (!currentCard) {
    return null
  }

  const questionText = studyMode === "englishToRussian" ? currentCard.englishWord : currentCard.russianTranslation
  const correctAnswer = studyMode === "englishToRussian" ? currentCard.russianTranslation : currentCard.englishWord

  const handleCheck = () => {
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const trimmedCorrect = correctAnswer.toLowerCase()
    const correct = trimmedAnswer === trimmedCorrect

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setCorrectAnswers(correctAnswers + 1)
    }
  }

  const handleNext = () => {
    if (currentCardIndex + 1 >= shuffledCards.length) {
      // Завершение сессии
      const percentage = Math.round((correctAnswers / shuffledCards.length) * 100)

      // Обновляем статистику каталога
      const updatedCatalog: Catalog = {
        ...catalog,
        lastStudied: new Date(),
        statistics: {
          ...catalog.statistics,
          [studyMode]: percentage,
        },
      }

      dispatch({ type: "UPDATE_CATALOG", payload: updatedCatalog })

      // Переходим к результатам
      navigation.replace("StudyResults", {
        catalog,
        totalCards: shuffledCards.length,
        correctAnswers,
        percentage,
        studyMode,
      })
    } else {
      // Следующая карточка
      setCurrentCardIndex(currentCardIndex + 1)
      setUserAnswer("")
      setShowResult(false)
      setIsCorrect(false)
      setShowExamples(false)
    }
  }

  const progress = ((currentCardIndex + 1) / shuffledCards.length) * 100

  return (
    <View style={styles.container}>
      {/* Прогресс */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentCardIndex + 1} из {shuffledCards.length}
        </Text>
      </View>

      {/* Карточка */}
      <View style={styles.cardContainer}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>
            {studyMode === "englishToRussian" ? "Переведите на русский:" : "Переведите на английский:"}
          </Text>
          <Text style={styles.questionText}>{questionText}</Text>
        </View>

        {/* Примеры (если есть) */}
        {currentCard.examples.length > 0 && !showResult && (
          <View style={styles.examplesContainer}>
            {!showExamples ? (
              <TouchableOpacity style={styles.showExamplesButton} onPress={() => setShowExamples(true)}>
                <Ionicons name="eye-outline" size={16} color="#007AFF" />
                <Text style={styles.showExamplesText}>Показать примеры ({currentCard.examples.length})</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.examplesHeader}>
                  <Text style={styles.examplesTitle}>Примеры использования:</Text>
                  <TouchableOpacity onPress={() => setShowExamples(false)}>
                    <Ionicons name="eye-off-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                {currentCard.examples.slice(0, 2).map((example, index) => (
                  <Text key={index} style={styles.exampleText}>
                    • {example}
                  </Text>
                ))}
              </>
            )}
          </View>
        )}

        {/* Поле ввода */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, showResult && (isCorrect ? styles.inputCorrect : styles.inputIncorrect)]}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Введите перевод..."
            editable={!showResult}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Результат */}
        {showResult && (
          <View style={styles.resultContainer}>
            <View style={[styles.resultBadge, isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
              <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={24} color="white" />
              <Text style={styles.resultText}>{isCorrect ? "Правильно!" : "Неправильно"}</Text>
            </View>

            {!isCorrect && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>Правильный ответ:</Text>
                <Text style={styles.correctAnswerText}>{correctAnswer}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Кнопки */}
      <View style={styles.buttonContainer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.button, styles.checkButton, !userAnswer.trim() && styles.disabledButton]}
            onPress={handleCheck}
            disabled={!userAnswer.trim()}
          >
            <Text style={styles.buttonText}>Проверить</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentCardIndex + 1 >= shuffledCards.length ? "Завершить" : "Продолжить"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Статистика сессии */}
      <View style={styles.sessionStats}>
        <Text style={styles.sessionStatsText}>
          Правильных ответов: {correctAnswers} из {currentCardIndex + (showResult ? 1 : 0)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0468B4",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  cardContainer: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  examplesContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  inputCorrect: {
    borderColor: "#0468B4",
    backgroundColor: "white",
  },
  inputIncorrect: {
    borderColor: "#A62290",
    backgroundColor: "#fff5f5",
  },
  resultContainer: {
    alignItems: "center",
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  correctBadge: {
    backgroundColor: "#0468B4",
  },
  incorrectBadge: {
    backgroundColor: "#A62290",
  },
  resultText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  correctAnswerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkButton: {
    backgroundColor: "#0468B4",
  },
  nextButton: {
    backgroundColor: "#0468B4",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  sessionStats: {
    backgroundColor: "white",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sessionStatsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  showExamplesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  showExamplesText: {
    fontSize: 14,
    color: "#0468B4",
    marginLeft: 8,
    fontWeight: "500",
  },
  examplesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
})
