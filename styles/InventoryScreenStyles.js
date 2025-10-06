import { colors } from './globalStyles';

export const inventoryStyles = {
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    productCount: {
        color: colors.primaryPink,
        fontWeight: '600',
    },
    inventoryCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        flex: 1,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    productDescription: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    productDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stockText: {
        fontSize: 14,
        color: colors.textLight,
    },
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockBadgeText: {
        fontSize: 12,
        color: colors.white,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    migratedText: {
        fontSize: 12,
        color: colors.textLight,
        fontStyle: 'italic',
        marginTop: 4,
    },
    migrationButton: {
        marginTop: 16
    }
};