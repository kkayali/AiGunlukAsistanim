export function moodColor(label) {
  switch (label) {
    case 'positive': return '#FFE680';
    case 'negative': return '#D3D3D3';
    default: return '#E6F0FF';
  }
}

export function moodEmoji(label) {
  switch (label) {
    case 'positive': return '🙂';
    case 'negative': return '😕';
    default: return '😐';
  }
}
