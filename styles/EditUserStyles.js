// styles/EditUserStyles.js
import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

export const editUserStyles = StyleSheet.create({
    formContainer: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: colors.white,
        color: colors.textDark,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.borderLight,
        gap: 8,
    },
    roleButtonSelected: {
        borderColor: colors.primaryFuchsia,
        backgroundColor: colors.primaryFuchsia,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
    },
    roleButtonTextSelected: {
        color: colors.white,
    },
    localesList: {
        maxHeight: 300,
    },
    localItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
        marginBottom: 8,
        backgroundColor: colors.white,
    },
    localItemSelected: {
        backgroundColor: colors.primaryPink,
        borderColor: colors.primaryPink,
    },
    localInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    localName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
    },
    localNameSelected: {
        color: colors.white,
    },
    localAddress: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
    },
    localAddressSelected: {
        color: colors.white + 'CC',
    },
    emptyLocales: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyLocalesText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 12,
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        backgroundColor: colors.white,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        backgroundColor: colors.primaryPink,
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: colors.textLight,
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
    passwordContainer: {
        marginTop: 8,
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        top: 12,
        zIndex: 1,
    },
});