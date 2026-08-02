import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Communication, QuotationStatus } from '@crm/types';
import {
  useAcceptQuotation,
  useCancelQuotation,
  useConvertQuotationToOrder,
  useQuotation,
  useRejectQuotation,
  useSendQuotation,
  useShareQuotation,
  useSubmitQuotation,
} from '@/features/quotations/useQuotations';
import { quotationStatusColor, quotationStatusLabel } from '@/features/quotations/status';
import { useAuth } from '@/lib/auth/useAuth';
import { ApiError } from '@/lib/api/api-error';

/** Statuses where the quotation is still "open" - Cancel remains available (plan Stage 1). */
const OPEN_STATUSES: readonly QuotationStatus[] = [
  'draft',
  'approval_pending',
  'approved',
  'sent',
  'negotiation',
];

export default function QuotationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { can } = useAuth();
  const { data: quotation, isLoading, isError } = useQuotation(id);
  const submit = useSubmitQuotation(id);
  const send = useSendQuotation(id);
  const accept = useAcceptQuotation(id);
  const reject = useRejectQuotation(id);
  const cancel = useCancelQuotation(id);
  const convertToOrder = useConvertQuotationToOrder(id);
  const share = useShareQuotation(id);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareChannel, setShareChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [shareRecipient, setShareRecipient] = useState('');
  const [shareRecipientError, setShareRecipientError] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<Communication | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !quotation) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this quotation.</Text>
      </SafeAreaView>
    );
  }

  function runAction(label: string, action: () => Promise<unknown>) {
    void action().catch((error: unknown) => {
      Alert.alert(`Unable to ${label}`, error instanceof ApiError ? error.message : 'Please try again.');
    });
  }

  async function submitCancel() {
    if (!cancelReason.trim()) return;
    try {
      await cancel.mutateAsync({ reason: cancelReason.trim() });
      setCancelModalOpen(false);
      setCancelReason('');
    } catch (error) {
      Alert.alert('Unable to cancel', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  async function handleConvert() {
    try {
      const order = await convertToOrder.mutateAsync();
      router.replace({ pathname: '/orders/orders/[id]', params: { id: order.id } });
    } catch (error) {
      Alert.alert('Unable to convert', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  function openShareModal() {
    setShareRecipient('');
    setShareRecipientError(null);
    setShareResult(null);
    setShareModalOpen(true);
  }

  async function submitShare() {
    setShareRecipientError(null);
    try {
      const result = await share.mutateAsync({
        channel: shareChannel,
        recipient: shareRecipient.trim() || undefined,
      });
      setShareResult(result);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      if (apiError?.isValidationError) {
        const [message] = apiError.fieldErrors('recipient');
        if (message) {
          setShareRecipientError(message);
          return;
        }
      }
      Alert.alert('Unable to share', apiError?.message ?? 'Please try again.');
    }
  }

  const canCancel = can('quotation.update') && OPEN_STATUSES.includes(quotation.status);
  const isBusy =
    submit.isPending ||
    send.isPending ||
    accept.isPending ||
    reject.isPending ||
    cancel.isPending ||
    convertToOrder.isPending ||
    share.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Sales'}</Text>
        </Pressable>

        <Text style={styles.number}>{quotation.quotationNumber}</Text>
        <Text style={styles.customer}>{quotation.customer.name}</Text>
        <Text style={[styles.status, { color: quotationStatusColor(quotation.status) }]}>
          {quotationStatusLabel(quotation.status)}
        </Text>
        {quotation.status === 'approval_pending' && (
          <Text style={styles.hint}>Awaiting approval - no action needed from you right now.</Text>
        )}

        <View style={styles.card}>
          {quotation.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} {item.unit} x {quotation.currencyCode} {item.unitPrice}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {quotation.currencyCode} {item.lineTotal}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              {quotation.currencyCode} {quotation.subtotal}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text style={styles.totalsValue}>
              -{quotation.currencyCode} {quotation.discountAmount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>
              {quotation.currencyCode} {quotation.taxAmount}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {quotation.currencyCode} {quotation.totalAmount}
            </Text>
          </View>
        </View>

        {quotation.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{quotation.notes}</Text>
          </>
        )}

        <View style={styles.actionsRow}>
          {quotation.status === 'draft' && can('quotation.update') && (
            <Pressable
              style={styles.actionButton}
              disabled={isBusy}
              onPress={() => runAction('submit', () => submit.mutateAsync())}
            >
              <Text style={styles.actionButtonText}>Submit</Text>
            </Pressable>
          )}
          {quotation.status === 'approved' && can('quotation.send') && (
            <Pressable
              style={styles.actionButton}
              disabled={isBusy}
              onPress={() => runAction('send', () => send.mutateAsync())}
            >
              <Text style={styles.actionButtonText}>Send</Text>
            </Pressable>
          )}
          {(quotation.status === 'sent' || quotation.status === 'negotiation') && can('quotation.update') && (
            <>
              <Pressable
                style={styles.actionButton}
                disabled={isBusy}
                onPress={() => runAction('accept', () => accept.mutateAsync())}
              >
                <Text style={styles.actionButtonText}>Accept</Text>
              </Pressable>
              <Pressable
                style={styles.actionButton}
                disabled={isBusy}
                onPress={() => runAction('reject', () => reject.mutateAsync())}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </Pressable>
            </>
          )}
          {quotation.status === 'accepted' && can('sales_order.create') && (
            <Pressable style={styles.actionButton} disabled={isBusy} onPress={() => void handleConvert()}>
              <Text style={styles.actionButtonText}>Convert to Order</Text>
            </Pressable>
          )}
          {can('quotation.send') && (
            <Pressable style={styles.actionButton} disabled={isBusy} onPress={openShareModal}>
              <Text style={styles.actionButtonText}>Share</Text>
            </Pressable>
          )}
          {canCancel && (
            <Pressable style={styles.actionButtonMuted} disabled={isBusy} onPress={() => setCancelModalOpen(true)}>
              <Text style={styles.actionButtonMutedText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <Modal visible={cancelModalOpen} transparent animationType="slide" onRequestClose={() => setCancelModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Quotation</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason *"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setCancelModalOpen(false)}>
                <Text style={styles.modalCancelText}>Back</Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirm, !cancelReason.trim() && styles.modalConfirmDisabled]}
                disabled={!cancelReason.trim() || cancel.isPending}
                onPress={() => void submitCancel()}
              >
                {cancel.isPending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.modalConfirmText}>Confirm</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={shareModalOpen} transparent animationType="slide" onRequestClose={() => setShareModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Share Quotation</Text>

            {shareResult ? (
              <>
                <View style={shareResult.status === 'failed' ? styles.shareErrorBanner : styles.shareSuccessBanner}>
                  <Text style={shareResult.status === 'failed' ? styles.shareErrorText : styles.shareSuccessText}>
                    {shareResult.status === 'failed'
                      ? `Could not send: ${shareResult.failureReason ?? 'Unknown error'}`
                      : `Sent to ${shareResult.recipient}.`}
                  </Text>
                </View>
                <View style={styles.modalActions}>
                  <Pressable style={styles.modalConfirm} onPress={() => setShareModalOpen(false)}>
                    <Text style={styles.modalConfirmText}>Done</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.shareChannelRow}>
                  <Pressable
                    style={[styles.shareChannelOption, shareChannel === 'whatsapp' && styles.shareChannelOptionActive]}
                    onPress={() => setShareChannel('whatsapp')}
                  >
                    <Text
                      style={[styles.shareChannelText, shareChannel === 'whatsapp' && styles.shareChannelTextActive]}
                    >
                      WhatsApp
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.shareChannelOption, shareChannel === 'email' && styles.shareChannelOptionActive]}
                    onPress={() => setShareChannel('email')}
                  >
                    <Text style={[styles.shareChannelText, shareChannel === 'email' && styles.shareChannelTextActive]}>
                      Email
                    </Text>
                  </Pressable>
                </View>

                <TextInput
                  style={[styles.modalInput, shareRecipientError && styles.inputError]}
                  placeholder={shareChannel === 'whatsapp' ? 'Phone number (optional override)' : 'Email address (optional override)'}
                  autoCapitalize="none"
                  keyboardType={shareChannel === 'whatsapp' ? 'phone-pad' : 'email-address'}
                  value={shareRecipient}
                  onChangeText={setShareRecipient}
                />
                {shareRecipientError ? (
                  <Text style={styles.fieldError}>{shareRecipientError}</Text>
                ) : (
                  <Text style={styles.shareHint}>Leave blank to use the customer&apos;s phone/email on file.</Text>
                )}

                <View style={styles.modalActions}>
                  <Pressable style={styles.modalCancel} onPress={() => setShareModalOpen(false)}>
                    <Text style={styles.modalCancelText}>Back</Text>
                  </Pressable>
                  <Pressable
                    style={styles.modalConfirm}
                    disabled={share.isPending}
                    onPress={() => void submitShare()}
                  >
                    {share.isPending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.modalConfirmText}>Send</Text>}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  back: { fontSize: 15, color: '#3b5bdb', marginBottom: 16 },
  number: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  customer: { fontSize: 15, color: '#334155', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  hint: { fontSize: 13, color: '#64748b', marginTop: 6 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 4,
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemMain: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  totalsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 12,
    gap: 6,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalsLabel: { fontSize: 13, color: '#64748b' },
  totalsValue: { fontSize: 13, color: '#0f172a' },
  grandTotalRow: { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  grandTotalLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  grandTotalValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  notes: { fontSize: 14, color: '#0f172a' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 },
  actionButton: {
    borderWidth: 1,
    borderColor: '#3b5bdb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#3b5bdb' },
  actionButtonMuted: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButtonMutedText: { fontSize: 13, fontWeight: '600', color: '#b91c1c' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  modalCancel: { paddingHorizontal: 14, paddingVertical: 10 },
  modalCancelText: { fontSize: 14, color: '#475569' },
  modalConfirm: { backgroundColor: '#3b5bdb', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  modalConfirmDisabled: { opacity: 0.5 },
  modalConfirmText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  shareChannelRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  shareChannelOption: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
  },
  shareChannelOptionActive: { borderColor: '#3b5bdb', backgroundColor: '#eef2ff' },
  shareChannelText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  shareChannelTextActive: { color: '#3b5bdb' },
  shareHint: { fontSize: 12, color: '#64748b', marginTop: 6 },
  inputError: { borderColor: '#dc2626' },
  fieldError: { fontSize: 12, color: '#dc2626', marginTop: 6 },
  shareSuccessBanner: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8, padding: 12 },
  shareSuccessText: { color: '#15803d', fontSize: 13 },
  shareErrorBanner: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, padding: 12 },
  shareErrorText: { color: '#b91c1c', fontSize: 13 },
});
