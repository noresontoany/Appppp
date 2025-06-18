"use client"

import { useState, useMemo } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData, type Card, type Catalog } from "../context/DataContext"

interface ExampleItem {
  id: string
  text: string
  card: Card
  catalog: Catalog
}

interface WordMatch {
  word: string
  start: number
  end: number
  card: Card
}

export default function ExamplesScreen({ navigation }: any) {
  const { state } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [showAddExampleModal, setShowAddExampleModal] = useState(false)
  const [newExample, setNewExample] = useState("")

  // Создаем список всех примеров с информацией о карточках и каталогах
  const allExamples = useMemo(() => {
    const examples: ExampleItem[] = []

    state.cards.forEach((card) => {
      const catalog = state.catalogs.find((c) => c.id === card.catalogId)
      if (catalog) {
        card.examples.forEach((example, index) => {
          examples.push({
            id: `${card.id}-${index}`,
            text: example,
            card,
            catalog,
          })
        })
      }
    })

    return examples
  }, [state.cards, state.catalogs])

  // Фильтрация примеров
  const filteredExamples = useMemo(() => {
    let filtered = allExamples

    // Фильтр по каталогу
    if (selectedCatalogId) {
      filtered = filtered.filter((example) => example.catalog.id === selectedCatalogId)
    }

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (example) =>
          example.text.toLowerCase().includes(query) ||
          example.card.englishWord.toLowerCase().includes(query) ||
          example.card.russianTranslation.toLowerCase().includes(query) ||
          example.catalog.name.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [allExamples, selectedCatalogId, searchQuery])

  // Функция для поиска совпадений слов в тексте
  const findWordMatches = (text: string): WordMatch[] => {
    const matches: WordMatch[] = []

    state.cards.forEach((card) => {
      const englishWord = card.englishWord.toLowerCase()

      // Ищем точные совпадения слов с учетом границ слов
      const wordRegex = new RegExp(`\\b${englishWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
      let match

      while ((match = wordRegex.exec(text)) !== null) {
        matches.push({
          word: match[0], // Оригинальный текст с сохранением регистра
          start: match.index,
          end: match.index + match[0].length,
          card,
        })
      }
    })

    // Убираем дубликаты и сортируем по позиции
    const uniqueMatches = matches.filter(
      (match, index, arr) => arr.findIndex((m) => m.start === match.start && m.end === match.end) === index,
    )

    return uniqueMatches.sort((a, b) => a.start - b.start)
  }

  const handleAddExample = () => {
    setNewExample("")
    setShowAddExampleModal(true)
  }

  const handleSaveExample = (cardId: string) => {
    if (!newExample.trim()) {
      Alert.alert("Ошибка", "Введите текст примера")
      return
    }

    const card = state.cards.find((c) => c.id === cardId)
    if (!card) {
      Alert.alert("Ошибка", "Карточка не найдена")
      return
    }

    if (card.examples.length >= 5) {
      Alert.alert("Ошибка", "Максимум 5 примеров на карточку")
      return
    }

    // Проверяем, содержит ли пример английское слово
    if (!newExample.toLowerCase().includes(card.englishWord.toLowerCase())) {
      Alert.alert("Ошибка", `Пример должен содержать слово "${card.englishWord}"`)
      return
    }

    const updatedCard = {
      ...card,
      examples: [...card.examples, newExample.trim()],
    }

    dispatch({ type: "UPDATE_CARD", payload: updatedCard })
    setShowAddExampleModal(false)
    setNewExample("")
  }

  const { dispatch } = useData()

  // Компонент для рендеринга текста с подсветкой
  const renderHighlightedText = (text: string) => {
    const matches = findWordMatches(text)

    if (matches.length === 0) {
      return <Text style={styles.exampleText}>{text}</Text>
    }

    const elements = []
    let lastIndex = 0

    matches.forEach((match, index) => {
      // Добавляем текст до совпадения
      if (match.start > lastIndex) {
        elements.push(
          <Text key={`text-${index}`} style={styles.exampleText}>
            {text.substring(lastIndex, match.start)}
          </Text>,
        )
      }

      // Добавляем подсвеченное слово с карточкой
      elements.push(
        <TouchableOpacity
          key={`match-${index}`}
          onPress={() => {
            setSelectedCard(match.card)
            setModalVisible(true)
          }}
        >
          <Text style={styles.highlightedWord}>{match.word}</Text>
        </TouchableOpacity>,
      )

      lastIndex = match.end
    })

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      elements.push(
        <Text key="text-end" style={styles.exampleText}>
          {text.substring(lastIndex)}
        </Text>,
      )
    }

    return <Text style={styles.exampleTextContainer}>{elements}</Text>
  }

  const renderExampleItem = ({ item }: { item: ExampleItem }) => {
    return (
      <View style={styles.exampleItem}>
        <View style={styles.exampleHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.englishWord}>{item.card.englishWord}</Text>
            <Text style={styles.russianWord}>{item.card.russianTranslation}</Text>
          </View>
          <View style={styles.catalogBadge}>
            <Text style={styles.catalogName}>{item.catalog.name}</Text>
          </View>
        </View>

        <View style={styles.exampleContent}>{renderHighlightedText(item.text)}</View>
      </View>
    )
  }

  const renderAddExampleModal = () => (
    <Modal
      visible={showAddExampleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddExampleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.addExampleModal}>
          <View style={styles.addExampleHeader}>
            <Text style={styles.addExampleTitle}>Добавить пример</Text>
            <TouchableOpacity onPress={() => setShowAddExampleModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.addExampleSubtitle}>Выберите карточку и добавьте новый пример</Text>

          <View style={styles.exampleInputContainer}>
            <Text style={styles.inputLabel}>Текст примера:</Text>
            <TextInput
              style={styles.exampleInput}
              value={newExample}
              onChangeText={setNewExample}
              placeholder="Введите пример предложения..."
              multiline
              maxLength={200}
              autoFocus
            />
            <Text style={styles.charCount}>{newExample.length}/200</Text>
          </View>

          <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.cardsTitle}>Выберите карточку:</Text>
            {state.cards
              .filter((card) => card.examples.length < 5)
              .map((card) => {
                const catalog = state.catalogs.find((c) => c.id === card.catalogId)
                const canAddExample = newExample.toLowerCase().includes(card.englishWord.toLowerCase())

                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[styles.cardOption, !canAddExample && styles.cardOptionDisabled]}
                    onPress={() => canAddExample && handleSaveExample(card.id)}
                    disabled={!canAddExample}
                  >
                    <View style={styles.cardOptionContent}>
                      <Text style={[styles.cardOptionEnglish, !canAddExample && styles.disabledText]}>
                        {card.englishWord}
                      </Text>
                      <Text style={[styles.cardOptionRussian, !canAddExample && styles.disabledText]}>
                        {card.russianTranslation}
                      </Text>
                      <Text style={[styles.cardOptionCatalog, !canAddExample && styles.disabledText]}>
                        {catalog?.name} • {card.examples.length}/5 примеров
                      </Text>
                    </View>
                    {canAddExample && <Ionicons name="add-circle" size={24} color="#0468B4" />}
                    {!canAddExample && newExample.trim() && (
                      <Text style={styles.requirementText}>Должно содержать "{card.englishWord}"</Text>
                    )}
                  </TouchableOpacity>
                )
              })}

            {state.cards.filter((card) => card.examples.length < 5).length === 0 && (
              <View style={styles.noCardsContainer}>
                <Text style={styles.noCardsText}>Все карточки уже имеют максимум примеров (5)</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.addExampleActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddExampleModal(false)}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  const renderFilterModal = () => (
    <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Фильтры</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={styles.filterSectionTitle}>Каталог</Text>

            <TouchableOpacity
              style={[styles.filterOption, selectedCatalogId === null && styles.filterOptionSelected]}
              onPress={() => setSelectedCatalogId(null)}
            >
              <Text style={[styles.filterOptionText, selectedCatalogId === null && styles.filterOptionTextSelected]}>
                Все каталоги ({allExamples.length})
              </Text>
              {selectedCatalogId === null && <Ionicons name="checkmark" size={20} color="#A62290" />}
            </TouchableOpacity>

            {state.catalogs.map((catalog) => {
              const examplesCount = allExamples.filter((ex) => ex.catalog.id === catalog.id).length
              const isSelected = selectedCatalogId === catalog.id

              return (
                <TouchableOpacity
                  key={catalog.id}
                  style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
                  onPress={() => setSelectedCatalogId(catalog.id)}
                >
                  <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>
                    {catalog.name} ({examplesCount})
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color="#A62290" />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedCatalogId(null)
                setSearchQuery("")
              }}
            >
              <Text style={styles.clearFiltersText}>Очистить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyFiltersText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  const renderCardModal = () => (
    <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
      <TouchableOpacity style={styles.cardModalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
        <View style={styles.cardModal}>
          {selectedCard && (
            <>
              <View style={styles.cardModalHeader}>
                <Text style={styles.cardModalEnglish}>{selectedCard.englishWord}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardModalRussian}>{selectedCard.russianTranslation}</Text>

              {selectedCard.examples.length > 0 && (
                <View style={styles.cardModalExamples}>
                  <Text style={styles.cardModalExamplesTitle}>Другие примеры ({selectedCard.examples.length}):</Text>
                  {selectedCard.examples.slice(0, 3).map((example, index) => (
                    <Text key={index} style={styles.cardModalExample}>
                      • {example}
                    </Text>
                  ))}
                  {selectedCard.examples.length > 3 && (
                    <Text style={styles.cardModalMore}>и еще {selectedCard.examples.length - 3}...</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  )

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Поиск и фильтры */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск по примерам, словам, переводам..."
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="filter" size={20} color="white" />
          {selectedCatalogId && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Показано {filteredExamples.length} из {allExamples.length} примеров
        </Text>
        {selectedCatalogId && (
          <Text style={styles.activeFilter}>
            Каталог: {state.catalogs.find((c) => c.id === selectedCatalogId)?.name}
          </Text>
        )}
      </View>

      {/* Список примеров */}
      {filteredExamples.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{allExamples.length === 0 ? "Нет примеров" : "Ничего не найдено"}</Text>
          <Text style={styles.emptySubtext}>
            {allExamples.length === 0
              ? "Добавьте примеры к карточкам для их отображения здесь"
              : "Попробуйте изменить поисковый запрос или фильтры"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExamples}
          renderItem={renderExampleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB для добавления примера */}
      {state.cards.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddExample}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Модальные окна */}
      {renderFilterModal()}
      {renderCardModal()}
      {renderAddExampleModal()}
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
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  searchIcon: {
    marginRight: 8,
    color: "#666",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#333",
  },
  clearSearch: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#A62290",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B0C7E6",
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilter: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  exampleItem: {
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
  exampleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  englishWord: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  russianWord: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  catalogBadge: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  catalogName: {
    fontSize: 12,
    color: "#0468B4",
    fontWeight: "500",
  },
  exampleContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  exampleTextContainer: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  exampleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  highlightedWord: {
    fontSize: 15,
    lineHeight: 22,
    color: "#A62290",
    fontWeight: "600",
    backgroundColor: "#A6229020",
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
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
  // Модальное окно фильтров
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get("window").height * 0.8,
    paddingBottom: 34,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  filterOptionSelected: {
    backgroundColor: "#0468B4",
    borderWidth: 1,
    borderColor: "#A62290",
  },
  filterOptionText: {
    fontSize: 15,
    color: "#333",
  },
  filterOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  filterActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#0468B4",
    alignItems: "center",
  },
  applyFiltersText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  // Модальное окно карточки
  cardModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxWidth: 320,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardModalEnglish: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  cardModalRussian: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  cardModalExamples: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  cardModalExamplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardModalExample: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginBottom: 4,
  },
  cardModalMore: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  // Модальное окно добавления примера
  addExampleModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get("window").height * 0.85,
    paddingBottom: 34,
  },
  addExampleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  addExampleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addExampleSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  exampleInputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  exampleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  cardOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  cardOptionDisabled: {
    opacity: 0.5,
  },
  cardOptionContent: {
    flex: 1,
  },
  cardOptionEnglish: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardOptionRussian: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cardOptionCatalog: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  disabledText: {
    color: "#ccc",
  },
  requirementText: {
    fontSize: 10,
    color: "#A62290",
    fontStyle: "italic",
    textAlign: "right",
    maxWidth: 120,
  },
  noCardsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noCardsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  addExampleActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
})
