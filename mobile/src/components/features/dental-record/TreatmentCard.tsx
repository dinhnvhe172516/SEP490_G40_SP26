import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

type Treatment = {
    _id: string;
    phase: 'PLAN' | 'SESSION';
    tooth_position?: string;
    note?: string;
    result?: string;
    performed_date?: string;
    planned_date?: string;
    status: string;
    medicine_usage?: { medicine_id?: { name?: string }; quantity?: number; usage_instruction?: string }[];
};

type Props = {
    treatments: Treatment[];
};

const TREATMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    PLANNED: { label: 'Kế hoạch', color: '#6B7280', bg: '#F9FAFB' },
    WAITING_APPROVAL: { label: 'Chờ duyệt', color: '#D97706', bg: '#FFFBEB' },
    APPROVED: { label: 'Đã duyệt', color: '#2563EB', bg: '#EFF6FF' },
    REJECTED: { label: 'Từ chối', color: '#DC2626', bg: '#FEF2F2' },
    IN_PROGRESS: { label: 'Đang thực hiện', color: '#7C3AED', bg: '#F5F3FF' },
    DONE: { label: 'Hoàn thành', color: '#059669', bg: '#ECFDF5' },
    CANCELLED: { label: 'Đã huỷ', color: '#9CA3AF', bg: '#F3F4F6' },
};

const PHASE_LABEL: Record<string, string> = {
    PLAN: 'Kế hoạch',
    SESSION: 'Buổi khám',
};

function TreatmentRow({ item, isLast }: { item: Treatment; isLast: boolean }) {
    const status = TREATMENT_STATUS[item.status] || { label: item.status, color: '#6B7280', bg: '#F9FAFB' };

    let dateDisplay = '';
    try {
        const raw = item.performed_date || item.planned_date;
        if (raw) {
            const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
            dateDisplay = format(d, 'dd/MM/yyyy', { locale: vi });
        }
    } catch (e) { console.log(e); }

    return (
        <View style={[styles.row, isLast && styles.rowLast]}>
            {/* Phase Tag */}
            <View style={[styles.phaseTag, item.phase === 'PLAN' ? styles.phaseTagPlan : styles.phaseTagSession]}>
                <ThemedText style={styles.phaseTagText}>{PHASE_LABEL[item.phase]}</ThemedText>
            </View>

            <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                    <ThemedText style={styles.toothPosition} numberOfLines={1}>
                        {item.tooth_position || item.note || 'Điều trị chung'}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <ThemedText style={[styles.statusText, { color: status.color }]}>{status.label}</ThemedText>
                    </View>
                </View>

                {!!item.result && (
                    <ThemedText style={styles.resultText} numberOfLines={2}>
                        Kết quả: {item.result}
                    </ThemedText>
                )}

                {!!dateDisplay && (
                    <ThemedText style={styles.dateText}>{dateDisplay}</ThemedText>
                )}

                {/* Thuốc */}
                {item.medicine_usage && item.medicine_usage.length > 0 && (
                    <View style={styles.medicineBox}>
                        <ThemedText style={styles.medicineTitle}>💊 Đơn thuốc</ThemedText>
                        {item.medicine_usage.map((m, idx) => (
                            <ThemedText key={idx} style={styles.medicineItem}>
                                • {m.medicine_id?.name || 'Thuốc'} × {m.quantity}
                                {m.usage_instruction ? ` — ${m.usage_instruction}` : ''}
                            </ThemedText>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

export function TreatmentCard({ treatments }: Props) {
    if (!treatments || treatments.length === 0) return null;

    return (
        <View style={styles.container}>
            <ThemedText style={styles.sectionTitle}>Phiếu điều trị</ThemedText>
            <View style={styles.card}>
                {treatments.map((t, index) => (
                    <TreatmentRow key={t._id} item={t} isLast={index === treatments.length - 1} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 16 },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        padding: 14,
        gap: 10,
    },
    rowLast: { borderBottomWidth: 0 },
    phaseTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        minWidth: 72,
        alignItems: 'center',
    },
    phaseTagPlan: { backgroundColor: '#EFF6FF' },
    phaseTagSession: { backgroundColor: '#F0FDF4' },
    phaseTagText: { fontSize: 11, fontWeight: '700', color: '#374151' },
    rowContent: { flex: 1 },
    rowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    toothPosition: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: { fontSize: 11, fontWeight: '600' },
    resultText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
        lineHeight: 18,
    },
    dateText: { fontSize: 12, color: '#9CA3AF' },
    medicineBox: {
        marginTop: 8,
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        padding: 10,
    },
    medicineTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 4,
    },
    medicineItem: {
        fontSize: 12,
        color: '#78350F',
        lineHeight: 18,
    },
});
