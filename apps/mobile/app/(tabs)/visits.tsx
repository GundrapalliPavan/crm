import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Placeholder - Site Visits (MOBILE_PRD.md section 7.4) is blocked on the data-model decision in MOBILE_ARCHITECTURE.md section 6 (a dedicated Visit entity vs. extending FollowUp), not yet resolved. */
export default function VisitsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Visits</Text>
        <Text style={styles.body}>Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  body: { fontSize: 14, color: '#475569', marginTop: 8 },
});
