import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import type { Catalog } from "../context/DataContext"

export default function StudyResultsScreen({ route, navigation }: any) {
  const { catalog, totalCards, correctAnswers, percentage, studyMode } = route.params as {
    catalog: Catalog
    totalCards: number
    correctAnswers: number
    percentage: number
    studyMode: "englishToRussian" | "russianToEnglish"
  }

  const getResultColor = () => {
    if (percentage >= 80) return "#0468B4"
    if (percentage >= 60) return "#A62290"
    return "#A62290"
  }

  const getResultMessage = () => {
    if (percentage >= 90) return "Отлично!"
    if (percentage >= 80) return "Хорошо!"
    if (percentage >= 60) return "Неплохо"
    return "Нужно повторить"
  }

  const modeTitle = studyMode === "englishToRussian" ? "Английский → Русский" : "Русский → Английский"

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Результат */}
        <View style={styles.resultContainer}>
          <View style={[styles.percentageCircle, { borderColor: getResultColor() }]}>
            <Text style={[styles.percentageText, { color: getResultColor() }]}>{percentage}%</Text>
          </View>

          <Text style={styles.resultMessage}>{getResultMessage()}</Text>
          <Text style={styles.catalogName}>{catalog.name}</Text>
          <Text style={styles.modeTitle}>{modeTitle}</Text>
        </View>

        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Правильно</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCards - correctAnswers}</Text>
            <Text style={styles.statLabel}>Ошибок</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCards}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </View>
      </View>

      {/* Кнопки */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.finishButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.finishButtonText}>Завершить</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  percentageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "white",
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  resultMessage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  catalogName: {
    fontSize: 18,
    color: "#666",
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 14,
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0468B4",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
  },
  finishButton: {
    backgroundColor: "#0468B4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  finishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
