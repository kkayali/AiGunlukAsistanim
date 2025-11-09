import React, { useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { addEntry } from '../services/storage';
import { analyzeSentiment, generateMessage } from '../services/hf';
import { moodColor, moodEmoji } from '../utils/sentimentHelpers';

const POSITIVE_TIPS = [
  'Bugünkü enerjini 10 dakikalık tempolu yürüyüşe ayır.',
  'Şükran notu yaz: bugün iyi giden 3 şeyi listele.',
  'Kısa sosyal temas: bir arkadaşına “nasılsın?” yaz.',
  'Odak molası: 25 dk derin çalışma + 5 dk ara yap.',
  'Uyku hijyeni: yatmadan 1 saat önce ekranı bırak.',
  'Hafif esneme veya 5 dk 4-7-8 nefesi yap.',
  'Bir bardak su iç ve esne.',
  'Mikro hedef: 15 dakikada bitecek tek işi seç.',
  'Gün ışığına 5 dk çık.',
  'Sevdiğin müzikle kısa ritüel yap.'
];
const NEGATIVE_TIPS = [
  '4-7-8 nefes tekniğiyle 10 nefes al.',
  'Duyguyu adlandır: “Şu an … hissediyorum” de ve kabul et.',
  'Bir bardak su iç ve 3 dk esneme yap.',
  'Kısa yürüyüş: 7–10 dakika.',
  '10 dk mikro görev + 2 dk ara yap.',
  'Düşünceyi sorgula: “Kanıtım ne?” diye yaz.',
  'Omuz-boyun 1 dk gevşetme yap.',
  'Günlük: 3 cümleyle içinden geçenleri yaz.',
  'Şeker/kafein yerine hafif atıştırmalık seç.',
  'Uyku hedef saatini belirle ve ekranı azalt.'
];
const NEUTRAL_TIPS = [
  'Bugün için tek küçük hedef belirle ve tamamla.',
  '5 dk derin nefes + omuz esnetme yap.',
  'Bir bardak su iç.',
  'Güneş ışığına kısa çık.',
  '25 dk odak + 5 dk mola uygula.',
  '2 dakikalık meditasyon başlat.',
  'Birine minik teşekkür yaz.',
  'Akşam ekran süresini azalt.',
  'Odanı 2 dakikalık mini toparla.',
  'Yarın için tek cümlelik niyet yaz.'
];

function pickTips(label, score, topics){
  const pool = label==='positive' ? POSITIVE_TIPS : label==='negative' ? NEGATIVE_TIPS : NEUTRAL_TIPS;
  const count = score>=0.7 ? 2 : 1;
  const base = pool.slice(0, count);
  const hasHealth = topics?.includes('sağlık');
  const healthExtra = hasHealth && label==='negative'
    ? 'Belirtiler sürerse bir hekime danışmanı öneririm.'
    : null;
  const out = [...base];
  if(healthExtra && out.length<2) out.push(healthExtra);
  return out.slice(0,2);
}

export default function DailyEntryScreen({ navigation }){
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const onAnalyze = async () => {
    if(!input.trim()) return;
    inputRef.current?.blur();
    Keyboard.dismiss();
    const state = await NetInfo.fetch();
    if(!state.isConnected){
      Alert.alert('Çevrimdışı','İnternet yokken yeni analiz yapılamaz. Geçmiş ve Haftalık Özet offline görüntülenebilir.');
      return;
    }
    setLoading(true);
    setError('');
    try{
      const sent = await analyzeSentiment(input.trim());
      const msg  = await generateMessage(input.trim(), sent.trLabel, sent.label, sent.score);
      const tips = pickTips(sent.label, sent.score, msg.topics);
      const entry = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        text: input.trim(),
        trLabel: sent.trLabel,
        level: sent.level,
        score: sent.score,
        label: sent.label,
        message: msg.message,
        topics: msg.topics || [],
        tips
      };
      await addEntry(entry);
      setResult(entry);
    }catch(e){
      setError(e.message || 'Analiz sırasında hata oluştu.');
    }finally{
      setLoading(false);
    }
  };

  const labelSafe = result?.label || 'neutral';

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text variant="titleLarge" style={{marginBottom:8}}>Bugünün notu</Text>
          <TextInput
            ref={inputRef}
            mode="outlined"
            placeholder='Örn: "Bugün motiveyim ama biraz yorgunum."'
            multiline
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={()=>{ inputRef.current?.blur(); Keyboard.dismiss(); }}
            value={input}
            onChangeText={setInput}
          />
          <Button mode="contained" style={{marginTop:12}} onPress={onAnalyze} disabled={loading}>
            Analiz Et
          </Button>

          {loading && <ActivityIndicator style={{marginTop:16}} />}

          {!!error && <Text style={{color:'red', marginTop:12}}>{error}</Text>}

          {result && (
            <Card style={{marginTop:16, backgroundColor: moodColor(labelSafe)}}>
              <Card.Title title={`Duygu durumu: ${result.trLabel}  ${moodEmoji(labelSafe)}`} />
              <Card.Content>
                <Text style={{marginBottom:10}}>{result.message}</Text>
                <Text variant="titleSmall" style={{marginBottom:4}}>Sana tavsiyem:</Text>
                {result.tips.map((t,i)=>(
                  <Text key={i} style={{marginBottom:4}}>• {t}</Text>
                ))}
              </Card.Content>
            </Card>
          )}

          <View style={{height:16}} />
          <Button mode="text" onPress={()=>navigation.navigate('Geçmiş')}>Geçmiş</Button>
          <Button mode="text" onPress={()=>navigation.navigate('Haftalık Özet')}>Haftalık Özet</Button>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16 }
});
