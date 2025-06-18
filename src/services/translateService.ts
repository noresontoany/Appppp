import AsyncStorage from "@react-native-async-storage/async-storage"

interface TranslationSuggestion {
  text: string
  confidence?: number
}

interface YandexTranslationResponse {
  translations: Array<{
    text: string
    detectedLanguageCode?: string
  }>
}

class TranslateService {
  private apiKey = "AQVN38Whj4yZoGL_hkbHSRxFdei93HHvCTaAMpo0"
  private cache: Map<string, TranslationSuggestion[]> = new Map()
  private baseUrl = "https://translate.api.cloud.yandex.net/translate/v2/translate"
  private cacheKey = "translation_cache"

  constructor() {
    this.loadCacheFromStorage()
  }

  private async loadCacheFromStorage() {
    try {
      const cachedData = await AsyncStorage.getItem(this.cacheKey)
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData)
        this.cache = new Map(Object.entries(parsedCache))
      }
    } catch (error) {
      console.log("Failed to load translation cache:", error)
    }
  }

  private async saveCacheToStorage() {
    try {
      const cacheObject = Object.fromEntries(this.cache)
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cacheObject))
    } catch (error) {
      console.log("Failed to save translation cache:", error)
    }
  }

  private getCacheKey(text: string, from: string, to: string): string {
    return `${text.toLowerCase()}_${from}_${to}`
  }

  async translateText(text: string, fromLang = "en", toLang = "ru"): Promise<TranslationSuggestion[]> {
    if (!text.trim() || text.length < 2) {
      return []
    }

    const cacheKey = this.getCacheKey(text, fromLang, toLang)

    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || []
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Api-Key ${this.apiKey}`,
        },
        body: JSON.stringify({
          targetLanguageCode: toLang,
          sourceLanguageCode: fromLang,
          texts: [text.trim()],
          format: "PLAIN_TEXT",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Translation API error: ${response.status} - ${errorText}`)
        throw new Error(`Translation API error: ${response.status}`)
      }

      const data: YandexTranslationResponse = await response.json()

      const suggestions: TranslationSuggestion[] = data.translations.map((translation) => ({
        text: translation.text,
        confidence: 1.0,
      }))

      // Кэшируем результат
      this.cache.set(cacheKey, suggestions)
      this.saveCacheToStorage()

      return suggestions
    } catch (error) {
      console.error("Translation error:", error)

      return []
    }
  }

  // Получить несколько вариантов перевода
  async getTranslationSuggestions(text: string, fromLang = "en", toLang = "ru"): Promise<TranslationSuggestion[]> {
    const mainTranslation = await this.translateText(text, fromLang, toLang)

    if (mainTranslation.length > 0) {
      const suggestions = [...mainTranslation]

      // Добавляем дополнительные варианты для популярных слов
      const additionalVariants = this.getAdditionalVariants(text.toLowerCase(), fromLang, toLang)
      suggestions.push(...additionalVariants)

      return suggestions.slice(0, 5) // Максимум 5 вариантов
    }

    return []
  }

  private getAdditionalVariants(word: string, fromLang: string, toLang: string): TranslationSuggestion[] {
    // Словарь дополнительных вариантов для популярных слов
    const enToRuVariants: Record<string, string[]> = {
      hello: ["привет", "здравствуйте", "приветствие"],
      good: ["хороший", "добрый", "качественный"],
      bad: ["плохой", "дурной", "скверный"],
      big: ["большой", "крупный", "огромный"],
      small: ["маленький", "небольшой", "крошечный"],
      beautiful: ["красивый", "прекрасный", "великолепный"],
      house: ["дом", "жилище", "здание"],
      car: ["машина", "автомобиль", "авто"],
      book: ["книга", "учебник", "том"],
      water: ["вода", "жидкость"],
      food: ["еда", "пища", "питание"],
      time: ["время", "период", "момент"],
      work: ["работа", "труд", "деятельность"],
      love: ["любовь", "привязанность", "обожание"],
      friend: ["друг", "приятель", "товарищ"],
      family: ["семья", "родня", "близкие"],
      money: ["деньги", "средства", "финансы"],
      school: ["школа", "учебное заведение"],
      teacher: ["учитель", "преподаватель", "педагог"],
      student: ["студент", "ученик", "учащийся"],
      cat: ["кот", "кошка", "котенок"],
      dog: ["собака", "пес", "щенок"],
      run: ["бегать", "бежать", "мчаться"],
      walk: ["идти", "гулять", "ходить"],
      eat: ["есть", "кушать", "питаться"],
      drink: ["пить", "выпивать"],
      sleep: ["спать", "дремать", "почивать"],
      read: ["читать", "изучать"],
      write: ["писать", "записывать"],
      speak: ["говорить", "разговаривать"],
    }

    const ruToEnVariants: Record<string, string[]> = {
      привет: ["hello", "hi", "greetings"],
      хороший: ["good", "nice", "fine"],
      плохой: ["bad", "poor", "awful"],
      большой: ["big", "large", "huge"],
      маленький: ["small", "little", "tiny"],
      красивый: ["beautiful", "pretty", "lovely"],
      дом: ["house", "home", "building"],
      машина: ["car", "auto", "vehicle"],
      книга: ["book", "volume"],
      вода: ["water", "liquid"],
      еда: ["food", "meal"],
      время: ["time", "period"],
      работа: ["work", "job", "labor"],
      любовь: ["love", "affection"],
      друг: ["friend", "buddy"],
      семья: ["family", "relatives"],
      деньги: ["money", "cash"],
      школа: ["school", "academy"],
      учитель: ["teacher", "instructor"],
      студент: ["student", "pupil"],
    }

    let variants: string[] = []

    if (fromLang === "en" && toLang === "ru" && enToRuVariants[word]) {
      variants = enToRuVariants[word].slice(1) // Пропускаем первый вариант (основной)
    } else if (fromLang === "ru" && toLang === "en" && ruToEnVariants[word]) {
      variants = ruToEnVariants[word].slice(1)
    }

    return variants.map((variant) => ({
      text: variant,
      confidence: 0.8,
    }))
  }

  clearCache(): void {
    this.cache.clear()
    AsyncStorage.removeItem(this.cacheKey)
  }
}

export const translateService = new TranslateService()
export type { TranslationSuggestion }


//npx expo start 