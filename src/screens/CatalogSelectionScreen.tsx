import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData, type Catalog } from "../context/DataContext"

export default function CatalogSelectionScreen({ route, navigation }: any) {
  const { state } = useData()
  const studyMode = route.params?.studyMode as "englishToRussian" | "russianToEnglish"

  const availableCatalogs = state.catalogs.filter((catalog) => {
    const cardsCount = state.cards.filter((card) => card.catalogId === catalog.id).length
    return cardsCount >= 5
  })

  const handleCatalogSelect = (catalog: Catalog) => {
    const cards = state.cards.filter((card) => card.catalogId === catalog.id)
    navigation.navigate("StudySession", {
      catalog,
      cards,
      studyMode,
    })
  }

  const renderCatalogItem = ({ item }: { item: Catalog }) => {
    const cardsCount = state.cards.filter((card) => card.catalogId === item.id).length

    return (
      <TouchableOpacity style={styles.catalogItem} onPress={() => handleCatalogSelect(item)}>
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogName}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>

        <View style={styles.catalogInfo}>
          <Text style={styles.cardsCount}>{cardsCount} карточек</Text>
          {item.statistics.englishToRussian > 0 && (
            <Text style={styles.statistics}>EN→RU: {item.statistics.englishToRussian}%</Text>
          )}
          {item.statistics.russianToEnglish > 0 && (
            <Text style={styles.statistics}>RU→EN: {item.statistics.russianToEnglish}%</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const modeTitle = studyMode === "englishToRussian" ? "Английский → Русский" : "Русский → Английский"
  const modeIcon = studyMode === "englishToRussian" ? "arrow-forward" : "arrow-back"
  const modeColor = studyMode === "englishToRussian" ? "#0468B4" : "#0468B4"

  return (
    <View style={styles.container}>
      {/* Заголовок режима */}
      <View style={styles.header}>
        <View style={[styles.modeIcon, { backgroundColor: modeColor + "20" }]}>
          <Ionicons name={modeIcon} size={24} color={modeColor} />
        </View>
        <Text style={styles.modeTitle}>{modeTitle}</Text>
        <Text style={styles.modeSubtitle}>Выберите каталог для изучения</Text>
      </View>

      {/* Список каталогов */}
      {availableCatalogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет доступных каталогов</Text>
          <Text style={styles.emptySubtext}>Добавьте карточки в каталоги (минимум 5 штук)</Text>
        </View>
      ) : (
        <FlatList
          data={availableCatalogs}
          renderItem={renderCatalogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  catalogItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catalogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catalogName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  catalogInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardsCount: {
    fontSize: 14,
    color: "#666",
  },
  statistics: {
    fontSize: 12,
    color: "#0468B4",
    fontWeight: "500",
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
  },
})
