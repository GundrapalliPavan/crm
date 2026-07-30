import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Placeholder - Leads (MOBILE_PRD.md section 7.3) is a later increment; this tab exists so the navigation shell reflects the real information architecture from day one. */
export default function LeadsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Leads</Text>
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
