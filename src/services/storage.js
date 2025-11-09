import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'entries_v1';

export async function getEntries() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addEntry(entry) {
  const list = await getEntries();
  list.unshift(entry);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
