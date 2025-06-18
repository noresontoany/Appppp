import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData } from "../context/DataContext"

export default function HomeScreen({ navigation }: any) {
  const { state } = useData()

  const totalCards = state.cards.length
  const totalCatalogs = state.catalogs.length
  const catalogsWithEnoughCards = state.catalogs.filter(
    (catalog) => state.cards.filter((card) => card.catalogId === catalog.id).length >= 5,
  ).length

  const handleModePress = (mode: "englishToRussian" | "russianToEnglish") => {
    if (catalogsWithEnoughCards === 0) {
      alert("Для изучения нужен хотя бы один каталог с 5 карточками")
      return
    }

    navigation.navigate("CatalogSelection", { studyMode: mode })
  }

  return (
    <View style={styles.container}>
      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCatalogs}</Text>
          <Text style={styles.statLabel}>Каталогов</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCards}</Text>
          <Text style={styles.statLabel}>Карточек</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{catalogsWithEnoughCards}</Text>
          <Text style={styles.statLabel}>Готовы к изучению</Text>
        </View>
      </View>

      {/* Заголовок */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Режимы изучения</Text>
        <Text style={styles.sectionSubtitle}>Выберите направление перевода</Text>
      </View>

      {/* Режимы изучения */}
      {totalCatalogs === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет каталогов</Text>
          <Text style={styles.emptySubtext}>Создайте каталог и добавьте карточки для начала изучения</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CatalogTab")}>
            <Text style={styles.createButtonText}>Создать каталог</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.modesContainer}>
          {/* Английский → Русский */}
          <TouchableOpacity
            style={[styles.modeCard, catalogsWithEnoughCards === 0 && styles.disabledCard]}
            onPress={() => handleModePress("englishToRussian")}
            disabled={catalogsWithEnoughCards === 0}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-forward" size={28} color="white" />
            </View>
            <Text style={[styles.modeTitle, catalogsWithEnoughCards === 0 && styles.disabledText]}>
              Английский → Русский
            </Text>
            <Text style={[styles.modeDescription, catalogsWithEnoughCards === 0 && styles.disabledText]}>
              Видите английское слово, вводите перевод на русском
            </Text>
            {catalogsWithEnoughCards === 0 && <Text style={styles.unavailableText}>Недоступно</Text>}
          </TouchableOpacity>

          {/* Русский → Английский */}
          <TouchableOpacity
            style={[styles.modeCard, catalogsWithEnoughCards === 0 && styles.disabledCard]}
            onPress={() => handleModePress("russianToEnglish")}
            disabled={catalogsWithEnoughCards === 0}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </View>
            <Text style={[styles.modeTitle, catalogsWithEnoughCards === 0 && styles.disabledText]}>
              Русский → Английский
            </Text>
            <Text style={[styles.modeDescription, catalogsWithEnoughCards === 0 && styles.disabledText]}>
              Видите русский перевод, вводите английское слово
            </Text>
            {catalogsWithEnoughCards === 0 && <Text style={styles.unavailableText}>Недоступно</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 90,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#A62290",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  modesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    gap: 12,
  },
  modeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0468B4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  modeDescription: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  disabledText: {
    color: "#999",
  },
  unavailableText: {
    fontSize: 11,
    color: "#A62290",
    fontWeight: "500",
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#0468B4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
