// styles/UserManagementStyles.js
import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

export const userManagementStyles = StyleSheet.create({
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    userCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userDetails: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 2,
    },
    userRole: {
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 8,
    },
    userId: {
        fontSize: 12,
        color: colors.textLight,
        fontFamily: 'monospace',
        marginTop: 4,
    },
    localesContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    localesLabel: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 4,
    },
    localTag: {
        backgroundColor: colors.primaryPink + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    localTagText: {
        fontSize: 12,
        color: colors.primaryFuchsia,
        fontWeight: '500',
    },
    userActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
        minWidth: 100,
        justifyContent: 'center',
    },
    editButton: {
        backgroundColor: colors.primaryBlue,
    },
    roleButton: {
        backgroundColor: colors.primaryFuchsia,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.textDark,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 12,
        textAlign: 'center',
        marginBottom: 16,
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
        fontSize: 16,
    },
});