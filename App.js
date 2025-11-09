import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import DailyEntryScreen from './src/screens/DailyEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import WeeklySummaryScreen from './src/screens/WeeklySummaryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Günlük Girdi" component={DailyEntryScreen} />
          <Stack.Screen name="Geçmiş" component={HistoryScreen} />
          <Stack.Screen name="Haftalık Özet" component={WeeklySummaryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
