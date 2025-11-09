import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { getEntries } from '../services/storage';
import { moodColor, moodEmoji } from '../utils/sentimentHelpers';

function safeLabel(e) {
  return e?.label || e?.sentiment?.label || 'neutral';
}
function safeText(e) {
  return e?.message || e?.summary || e?.text || '';
}

export default function HistoryScreen() {
  const [list, setList] = useState(null);

  useEffect(() => {
    (async () => setList(await getEntries()))();
  }, []);

  if (!list) return <ActivityIndicator style={{ marginTop: 24 }} />;

  return (
    <View style={{ flex:1, padding: 12 }}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const label = safeLabel(item);
          return (
            <Card style={{ marginBottom: 12, backgroundColor: moodColor(label) }}>
              <Card.Title
                title={`${new Date(item.date).toLocaleString()}  ${moodEmoji(label)}`}
                subtitle={`Duygu: ${label}`}
              />
              <Card.Content>
                {!!item.text && <Text style={{ marginBottom: 6 }}>Girdi: {item.text}</Text>}
                <Text>{safeText(item)}</Text>
                {!!item.tips?.length && (
                  <>
                    <Text style={{ marginTop: 8, marginBottom: 4 }}>Sana tavsiyem:</Text>
                    {item.tips.map((t, i) => <Text key={i}>• {t}</Text>)}
                  </>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}
