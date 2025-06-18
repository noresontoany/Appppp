import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData, type Catalog } from "../context/DataContext"

export default function CatalogListScreen({ navigation }: any) {
  const { state, dispatch } = useData()

  const handleDeleteCatalog = (catalog: Catalog) => {
    const cardsCount = state.cards.filter((card) => card.catalogId === catalog.id).length

    Alert.alert(
      "Удалить каталог?",
      `Каталог "${catalog.name}" и все ${cardsCount} карточек будут удалены безвозвратно.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => dispatch({ type: "DELETE_CATALOG", payload: catalog.id }),
        },
      ],
    )
  }

  const handleStudyPress = (catalog: Catalog) => {
    const cards = state.cards.filter((card) => card.catalogId === catalog.id)
    navigation.navigate("HomeTab", {
      screen: "CatalogSelection",
      params: { studyMode: "englishToRussian", preselectedCatalog: catalog },
    })
  }

  const renderCatalogItem = ({ item }: { item: Catalog }) => {
    const cardsCount = state.cards.filter((card) => card.catalogId === item.id).length
    const canStudy = cardsCount >= 5

    return (
      <TouchableOpacity
        style={styles.catalogItem}
        onPress={() => navigation.navigate("CatalogDetail", { catalogId: item.id })}
      >
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogName}>{item.name}</Text>
          <View style={styles.catalogActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                navigation.navigate("AddEditCatalog", { catalog: item })
              }}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                handleDeleteCatalog(item)
              }}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.catalogInfo}>
          <Text style={styles.cardsCount}>Карточек: {cardsCount}/50</Text>
          {item.statistics.englishToRussian > 0 && (
            <Text style={styles.statistics}>EN→RU: {item.statistics.englishToRussian}%</Text>
          )}
          {item.statistics.russianToEnglish > 0 && (
            <Text style={styles.statistics}>RU→EN: {item.statistics.russianToEnglish}%</Text>
          )}
        </View>

        {canStudy && (
          <TouchableOpacity
            style={styles.studyButton}
            onPress={(e) => {
              e.stopPropagation()
              handleStudyPress(item)
            }}
          >
            <Ionicons name="school" size={16} color="white" />
            <Text style={styles.studyButtonText}>Повторить</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {state.catalogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет каталогов</Text>
          <Text style={styles.emptySubtext}>Создайте первый каталог для начала изучения слов</Text>
        </View>
      ) : (
        <FlatList
          data={state.catalogs}
          renderItem={renderCatalogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddEditCatalog")}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
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
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
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
  catalogActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
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
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0468B4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  studyButton: {
    backgroundColor: "#A62290",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  studyButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
  },
})
