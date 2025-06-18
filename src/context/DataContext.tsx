"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface Card {
  id: string
  englishWord: string
  russianTranslation: string
  examples: string[]
  catalogId: string
  createdAt: Date
}

export interface Catalog {
  id: string
  name: string
  createdAt: Date
  lastStudied?: Date
  statistics: {
    englishToRussian: number
    russianToEnglish: number
  }
}

interface AppState {
  catalogs: Catalog[]
  cards: Card[]
  loading: boolean
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_DATA"; payload: { catalogs: Catalog[]; cards: Card[] } }
  | { type: "ADD_CATALOG"; payload: Catalog }
  | { type: "UPDATE_CATALOG"; payload: Catalog }
  | { type: "DELETE_CATALOG"; payload: string }
  | { type: "ADD_CARD"; payload: Card }
  | { type: "UPDATE_CARD"; payload: Card }
  | { type: "DELETE_CARD"; payload: string }

const initialState: AppState = {
  catalogs: [],
  cards: [],
  loading: true,
}

function dataReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "LOAD_DATA":
      return {
        ...state,
        catalogs: action.payload.catalogs,
        cards: action.payload.cards,
        loading: false,
      }
    case "ADD_CATALOG":
      return { ...state, catalogs: [...state.catalogs, action.payload] }
    case "UPDATE_CATALOG":
      return {
        ...state,
        catalogs: state.catalogs.map((catalog) => (catalog.id === action.payload.id ? action.payload : catalog)),
      }
    case "DELETE_CATALOG":
      return {
        ...state,
        catalogs: state.catalogs.filter((catalog) => catalog.id !== action.payload),
        cards: state.cards.filter((card) => card.catalogId !== action.payload),
      }
    case "ADD_CARD":
      return { ...state, cards: [...state.cards, action.payload] }
    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map((card) => (card.id === action.payload.id ? action.payload : card)),
      }
    case "DELETE_CARD":
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== action.payload),
      }
    default:
      return state
  }
}

const DataContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("catalogs", JSON.stringify(state.catalogs))
      await AsyncStorage.setItem("cards", JSON.stringify(state.cards))
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  const loadData = async () => {
    try {
      const catalogsData = await AsyncStorage.getItem("catalogs")
      const cardsData = await AsyncStorage.getItem("cards")

      const catalogs = catalogsData ? JSON.parse(catalogsData) : []
      const cards = cardsData ? JSON.parse(cardsData) : []

      dispatch({ type: "LOAD_DATA", payload: { catalogs, cards } })
    } catch (error) {
      console.error("Error loading data:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!state.loading) {
      saveData()
    }
  }, [state.catalogs, state.cards])

  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
