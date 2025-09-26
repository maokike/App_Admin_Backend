import { StyleSheet } from 'react-native';
import { colors, globalStyles } from './globalStyles';

export const localDashboardStyles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    welcomeText: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 2,
    },
    roleText: {
        fontSize: 14,
        color: colors.primaryPink,
        fontWeight: '600',
        marginTop: 2,
    },
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
    localIcon: {
        backgroundColor: colors.primaryPink,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    localRole: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
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