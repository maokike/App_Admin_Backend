import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './globalStyles';

const { width } = Dimensions.get('window');

export const adminDashboardStyles = StyleSheet.create({
    // Header
    userName: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryPink,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    logoutText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // Estadísticas
    statsSection: {
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    statCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        width: (width - 56) / 2,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'center',
    },

    // Gráfico
    chartSection: {
        padding: 16,
        marginTop: 8,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 12,
    },
    chartPlaceholder: {
        height: 220,
        backgroundColor: colors.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    emptyChart: {
        height: 220,
        backgroundColor: colors.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },

    // Ventas Recientes
    recentSalesSection: {
        padding: 16,
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        color: colors.primaryPink,
        fontSize: 14,
        fontWeight: '600',
    },
    recentSalesList: {
        gap: 8,
    },
    recentSaleCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    saleDetails: {
        flex: 1,
    },
    saleTime: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 2,
    },
    saleProducts: {
        fontSize: 12,
        color: colors.textLight,
    },
    saleAmount: {
        alignItems: 'flex-end',
    },
    saleTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.success,
        marginBottom: 4,
    },
    paymentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    paymentText: {
        fontSize: 10,
        fontWeight: '600',
    },

    // Gestión Rápida
    managementSection: {
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    managementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    managementCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        width: (width - 56) / 2,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    managementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    managementText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textDark,
        textAlign: 'center',
    },

    // Estados de carga y vacío
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
    },
    loadingText: {
        marginTop: 8,
        color: colors.textLight,
        fontSize: 14,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
    },
    emptyText: {
        marginTop: 8,
        color: colors.textLight,
        fontSize: 14,
        textAlign: 'center',
    },
});