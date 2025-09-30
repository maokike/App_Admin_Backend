import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

export const localDashboardStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryPink,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: colors.white,
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
    },
    quickActions: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textDark,
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    localesCount: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: '500',
    },
    localCard: {
        backgroundColor: colors.white,
        marginHorizontal: 20,
        marginVertical: 6,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    localIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryPink,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    localInfo: {
        flex: 1,
    },
    localName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 2,
    },
    localRole: {
        fontSize: 14,
        color: colors.primaryPink,
        marginBottom: 2,
    },
    localId: {
        fontSize: 12,
        color: colors.textLight,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 12,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
        fontSize: 16,
    },
});