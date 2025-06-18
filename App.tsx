import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

import { DataProvider } from "./src/context/DataContext"
import CatalogListScreen from "./src/screens/CatalogListScreen"
import AddEditCatalogScreen from "./src/screens/AddEditCatalogScreen"
import HomeScreen from "./src/screens/HomeScreen"
import ExamplesScreen from "./src/screens/ExamplesScreen"
import CatalogDetailScreen from "./src/screens/CatalogDetailScreen"
import AddEditCardScreen from "./src/screens/AddEditCardScreen"
import CatalogSelectionScreen from "./src/screens/CatalogSelectionScreen"
import StudySessionScreen from "./src/screens/StudySessionScreen"
import StudyResultsScreen from "./src/screens/StudyResultsScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function CatalogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CatalogList" component={CatalogListScreen} options={{ title: "Каталоги" }} />
      <Stack.Screen name="CatalogDetail" component={CatalogDetailScreen} options={{ title: "Карточки" }} />
      <Stack.Screen name="AddEditCatalog" component={AddEditCatalogScreen} options={{ title: "Каталог" }} />
      <Stack.Screen name="AddEditCard" component={AddEditCardScreen} options={{ title: "Карточка" }} />
    </Stack.Navigator>
  )
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Главная" }} />
      <Stack.Screen name="CatalogSelection" component={CatalogSelectionScreen} options={{ title: "Выбор каталога" }} />
      <Stack.Screen name="StudySession" component={StudySessionScreen} options={{ title: "Изучение" }} />
      <Stack.Screen name="StudyResults" component={StudyResultsScreen} options={{ title: "Результаты" }} />
    </Stack.Navigator>
  )
}

function ExamplesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Examples" component={ExamplesScreen} options={{ title: "Примеры" }} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any

              if (route.name === "CatalogTab") {
                iconName = focused ? "library" : "library-outline"
              } else if (route.name === "HomeTab") {
                iconName = focused ? "home" : "home-outline"
              } else if (route.name === "ExamplesTab") {
                iconName = focused ? "document-text" : "document-text-outline"
              } else {
                iconName = "help-outline"
              }

              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "#0468B4",
            tabBarInactiveTintColor: "#999",
            tabBarStyle: {
              backgroundColor: "white",
              borderTopColor: "#f0f0f0",
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="CatalogTab" component={CatalogStack} options={{ title: "Каталоги" }} />
          <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "Главная" }} />
          <Tab.Screen name="ExamplesTab" component={ExamplesStack} options={{ title: "Примеры" }} />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  )
}
