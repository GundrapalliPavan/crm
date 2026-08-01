import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Company } from '@crm/types';
import { useCompaniesList } from '@/features/companies/useCompanies';
import { useCategories } from '@/features/catalog/useCatalog';
import { useCreateQuotation } from '@/features/quotations/useQuotations';
import { previewLineTotal } from '@/features/quotations/status';
import { ApiError } from '@/lib/api/api-error';

interface DraftLine {
  id: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  discountPercentage: string;
}

/** Module-level (not a nested function inside the component) so eslint-plugin-react-hooks's
 *  purity rule doesn't mistake this impure random read for a render-time call. `globalThis.crypto`
 *  is not always defined in the Hermes/Expo Go runtime (see lib/api/client.ts's request-id header),
 *  so this only needs a locally-unique key for a React list, not a real UUID. */
function generateLineId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Ad-hoc items have no catalog product to read a GST rate from, so tax is always 0% - matches the backend's resolveCustomLine. */
function draftLineTotal(line: DraftLine): number {
  return previewLineTotal(line.quantity, line.unitPrice, line.discountPercentage, '0');
}

/**
 * Quotation builder (MOBILE_PRD.md section 7.6). Line items are ad-hoc: the
 * Sales Executive picks a Category for context, then names the item and its
 * quantity directly - there is no product search/picker, and the name is
 * never written to the Product catalog (product direction narrowing this
 * app's Sales scope; the name is for reference only, like a per-line note).
 */
export default function QuotationCreateScreen() {
  const createQuotation = useCreateQuotation();

  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const companies = useCompaniesList({
    search: companySearch.trim() || undefined,
    isCustomer: true,
    pageSize: 20,
  });

  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const categories = useCategories();

  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  const [lines, setLines] = useState<DraftLine[]>([]);
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + draftLineTotal(line), 0), [lines]);

  function addItem() {
    if (!itemName.trim() || !itemQuantity.trim()) return;
    setLines((current) => [
      ...current,
      {
        id: generateLineId(),
        productName: itemName.trim(),
        quantity: itemQuantity.trim(),
        unitPrice: '0',
        discountPercentage: '0',
      },
    ]);
    setItemName('');
    setItemQuantity('');
  }

  function updateLine(id: string, patch: Partial<Pick<DraftLine, 'quantity' | 'unitPrice' | 'discountPercentage'>>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!selectedCompany) {
      setSubmitError('Select a customer.');
      return;
    }
    if (lines.length === 0) {
      setSubmitError('Add at least one item.');
      return;
    }
    try {
      const quotation = await createQuotation.mutateAsync({
        customerCompanyId: selectedCompany.id,
        quotationDate: new Date().toISOString(),
        items: lines.map((line) => ({
          customProductName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountPercentage: line.discountPercentage || undefined,
        })),
        notes: notes || undefined,
      });
      router.replace({ pathname: '/orders/quotations/[id]', params: { id: quotation.id } });
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Unable to create quotation. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Cancel</Text>
          </Pressable>
          <Text style={styles.heading}>New Quotation</Text>
          <View style={{ width: 50 }} />
        </View>

        <Text style={styles.label}>Customer *</Text>
        {selectedCompany ? (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedName}>{selectedCompany.name}</Text>
            <Pressable onPress={() => setSelectedCompany(null)}>
              <Text style={styles.changeLink}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Search customers"
              value={companySearch}
              onChangeText={setCompanySearch}
              autoCapitalize="none"
            />
            <View style={styles.pickerList}>
              {companies.data?.data.map((company) => (
                <Pressable key={company.id} style={styles.pickerRow} onPress={() => setSelectedCompany(company)}>
                  <Text style={styles.pickerRowText}>{company.name}</Text>
                </Pressable>
              ))}
              {companies.data?.data.length === 0 && (
                <Text style={styles.emptyHint}>No customers found.</Text>
              )}
            </View>
          </>
        )}

        <Text style={styles.label}>Items *</Text>
        <View style={styles.chipWrap}>
          {categories.data?.data.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.chip, categoryId === category.id && styles.chipActive]}
              onPress={() => setCategoryId(categoryId === category.id ? undefined : category.id)}
            >
              <Text style={[styles.chipText, categoryId === category.id && styles.chipTextActive]}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {categoryId && (
          <View style={styles.addItemCard}>
            <Text style={styles.lineFieldLabel}>Product name</Text>
            <TextInput
              style={styles.input}
              placeholder="What the customer wants"
              value={itemName}
              onChangeText={setItemName}
            />
            <Text style={[styles.lineFieldLabel, styles.addItemFieldSpacing]}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2"
              value={itemQuantity}
              onChangeText={setItemQuantity}
              keyboardType="decimal-pad"
            />
            <Pressable
              style={[styles.addItemButton, (!itemName.trim() || !itemQuantity.trim()) && styles.addItemButtonDisabled]}
              onPress={addItem}
              disabled={!itemName.trim() || !itemQuantity.trim()}
            >
              <Text style={styles.addItemButtonText}>+ Add Item</Text>
            </Pressable>
          </View>
        )}

        {lines.map((line) => (
          <View key={line.id} style={styles.lineCard}>
            <View style={styles.lineHeader}>
              <Text style={styles.lineTitle}>{line.productName}</Text>
              <Pressable onPress={() => removeLine(line.id)}>
                <Text style={styles.removeLabel}>Remove</Text>
              </Pressable>
            </View>
            <View style={styles.lineFieldsRow}>
              <View style={styles.lineField}>
                <Text style={styles.lineFieldLabel}>Qty</Text>
                <TextInput
                  style={styles.lineInput}
                  value={line.quantity}
                  onChangeText={(value) => updateLine(line.id, { quantity: value })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.lineFieldLabel}>Unit Price</Text>
                <TextInput
                  style={styles.lineInput}
                  value={line.unitPrice}
                  onChangeText={(value) => updateLine(line.id, { unitPrice: value })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.lineFieldLabel}>Disc %</Text>
                <TextInput
                  style={styles.lineInput}
                  value={line.discountPercentage}
                  onChangeText={(value) => updateLine(line.id, { discountPercentage: value })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Text style={styles.lineTotal}>Line total (est.): {draftLineTotal(line).toFixed(2)}</Text>
          </View>
        ))}

        {lines.length > 0 && <Text style={styles.grandTotal}>Total (est.): {totalAmount.toFixed(2)}</Text>}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        {submitError && <Text style={styles.fieldError}>{submitError}</Text>}

        <Pressable
          style={[styles.submitButton, createQuotation.isPending && styles.submitButtonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={createQuotation.isPending}
        >
          {createQuotation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>Create Quotation</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { fontSize: 15, color: '#3b5bdb' },
  heading: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginTop: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  fieldError: { fontSize: 12, color: '#dc2626', marginTop: 10 },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  selectedName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  changeLink: { fontSize: 13, color: '#3b5bdb', fontWeight: '600' },
  pickerList: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerRowText: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
  emptyHint: { fontSize: 13, color: '#64748b', padding: 14, textAlign: 'center' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  chipActive: { backgroundColor: '#3b5bdb', borderColor: '#3b5bdb' },
  chipText: { fontSize: 13, color: '#475569' },
  chipTextActive: { color: '#ffffff', fontWeight: '600' },
  addItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 12,
  },
  addItemFieldSpacing: { marginTop: 10 },
  addItemButton: {
    backgroundColor: '#3b5bdb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  addItemButtonDisabled: { opacity: 0.5 },
  addItemButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  lineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 12,
  },
  lineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lineTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a', flex: 1, marginRight: 8 },
  removeLabel: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  lineFieldsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  lineField: { flex: 1 },
  lineFieldLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  lineInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#ffffff',
  },
  lineTotal: { fontSize: 12, color: '#475569', marginTop: 8 },
  grandTotal: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 16, textAlign: 'right' },
  submitButton: {
    backgroundColor: '#3b5bdb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
