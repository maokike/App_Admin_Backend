import { StyleSheet } from 'react-native';
import { colors, globalStyles } from './globalStyles';

export const adminDashboardStyles = StyleSheet.create({
    userName: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    localesCount: {
        color: colors.primaryPink,
        fontWeight: '600',
    },
    localCard: {
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    localInfo: {
        flex: 1,
        marginLeft: 12,
    },
    localName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
    },
    localAddress: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryPink,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    logoutText: {
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
    },
});