"use client"

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData, type Card } from "../context/DataContext"
import { useEffect } from "react"

export default function CatalogDetailScreen({ route, navigation }: any) {
  const { state, dispatch } = useData()
  const catalogId = route.params?.catalogId as string

  const catalog = state.catalogs.find((c) => c.id === catalogId)
  const cards = state.cards.filter((card) => card.catalogId === catalogId)

  useEffect(() => {
    if (catalog) {
      navigation.setOptions({
        title: catalog.name,
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate("AddEditCard", { catalogId })}
          >
            <Ionicons name="add" size={24} color="#A62290" />
          </TouchableOpacity>
        ),
      })
    }
  }, [catalog, navigation, catalogId])

  const handleDeleteCard = (card: Card) => {
    Alert.alert("Удалить карточку?", `Карточка "${card.englishWord}" будет удалена безвозвратно.`, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => dispatch({ type: "DELETE_CARD", payload: card.id }),
      },
    ])
  }

  const renderCardItem = ({ item }: { item: Card }) => {
    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <View style={styles.cardWords}>
            <Text style={styles.englishWord}>{item.englishWord}</Text>
            <Text style={styles.russianWord}>{item.russianTranslation}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddEditCard", { catalogId, card: item })}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteCard(item)} style={styles.actionButton}>
              <Ionicons name="trash" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {item.examples.length > 0 && (
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Примеры ({item.examples.length}/5):</Text>
            {item.examples.map((example, index) => (
              <Text key={index} style={styles.exampleText}>
                • {example}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.createdDate}>Создано: {new Date(item.createdAt).toLocaleDateString("ru-RU")}</Text>
          {item.examples.length === 0 && <Text style={styles.noExamples}>Нет примеров</Text>}
        </View>
      </View>
    )
  }

  if (!catalog) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Каталог не найден</Text>
      </View>
    )
  }

  const canStudy = cards.length >= 5
  const maxCardsReached = cards.length >= 50

  return (
    <View style={styles.container}>
      {/* Информация о каталоге */}
      <View style={styles.catalogInfo}>
        <View style={styles.catalogStats}>
          <Text style={styles.cardsCount}>
            Карточек: {cards.length}/50
            {maxCardsReached && <Text style={styles.maxReached}> (максимум)</Text>}
          </Text>
          {canStudy ? (
            <Text style={styles.readyToStudy}>✓ Готов к изучению</Text>
          ) : (
            <Text style={styles.notReady}>Нужно еще {5 - cards.length} карточек</Text>
          )}
        </View>

        {canStudy && (
          <TouchableOpacity
            style={styles.studyButton}
            onPress={() => navigation.navigate("HomeTab", { screen: "Home" })}
          >
            <Ionicons name="school" size={16} color="white" />
            <Text style={styles.studyButtonText}>Изучать</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Список карточек */}
      {cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет карточек</Text>
          <Text style={styles.emptySubtext}>Добавьте первую карточку для начала изучения</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate("AddEditCard", { catalogId })}
          >
            <Text style={styles.addFirstButtonText}>Добавить карточку</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB для добавления карточки */}
      {cards.length > 0 && !maxCardsReached && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddEditCard", { catalogId })}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
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
  errorText: {
    color: "#666",
    fontSize: 16,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  catalogInfo: {
    backgroundColor: "white",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  catalogStats: {
    flex: 1,
  },
  cardsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  maxReached: {
    color: "#A62290",
    fontWeight: "normal",
  },
  readyToStudy: {
    fontSize: 14,
    color: "#0468B4",
    marginTop: 4,
  },
  notReady: {
    fontSize: 14,
    color: "#A62290",
    marginTop: 4,
  },
  studyButton: {
    backgroundColor: "#0468B4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  studyButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  cardItem: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardWords: {
    flex: 1,
  },
  englishWord: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  russianWord: {
    fontSize: 16,
    color: "#666",
  },
  cardActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  examplesContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createdDate: {
    fontSize: 12,
    color: "#999",
  },
  noExamples: {
    fontSize: 12,
    color: "#ccc",
    fontStyle: "italic",
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
  addFirstButton: {
    backgroundColor: "#0468B4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
})
