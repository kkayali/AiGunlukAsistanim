import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { Svg, Circle } from 'react-native-svg';
import { getEntries } from '../services/storage';

function isInLast7Days(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / (1000*60*60*24);
  return diff <= 7;
}
function safeLabel(e) {
  return e?.label || e?.sentiment?.label || 'neutral';
}

export default function WeeklySummaryScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await getEntries();
      const last7 = all.filter(e => isInLast7Days(e.date));
      const counts = last7.reduce((acc, e) => {
        const lab = safeLabel(e);
        acc[lab] = (acc[lab] || 0) + 1;
        return acc;
      }, {});
      const total = last7.length || 1;
      setData({
        total,
        counts: {
          positive: counts.positive || 0,
          neutral: counts.neutral || 0,
          negative: counts.negative || 0,
        }
      });
    })();
  }, []);

  if (!data) return <ActivityIndicator style={{ marginTop: 24 }} />;

  const size = 140;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  const p = data.counts.positive / data.total;
  const n = data.counts.neutral / data.total;
  const neg = data.counts.negative / data.total;

  const arc = (ratio) => Math.max(0, Math.min(C, C * ratio));
  const segP = arc(p);
  const segN = arc(n);
  const segNeg = arc(neg);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Card>
        <Card.Title title="Son 7 Gün Özeti" />
        <Card.Content>
          <Text>Toplam giriş: {data.total}</Text>
          <Text>Pozitif: {data.counts.positive}</Text>
          <Text>Nötr: {data.counts.neutral}</Text>
          <Text>Negatif: {data.counts.negative}</Text>

          <View style={{ alignItems:'center', marginTop: 16 }}>
            <Svg width={size} height={size}>
              <Circle cx={cx} cy={cy} r={r} stroke="#eee" strokeWidth={stroke} fill="none" />
              <Circle
                cx={cx} cy={cy} r={r}
                stroke="#FFE680"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${segP} ${C - segP}`}
                strokeDashoffset={0}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <Circle
                cx={cx} cy={cy} r={r}
                stroke="#E6F0FF"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${segN} ${C - segN}`}
                strokeDashoffset={-segP}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <Circle
                cx={cx} cy={cy} r={r}
                stroke="#D3D3D3"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${segNeg} ${C - segNeg}`}
                strokeDashoffset={-(segP + segN)}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </Svg>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
