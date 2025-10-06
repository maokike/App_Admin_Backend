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
        marginBottom: 12,
        fontStyle: 'italic',
    },
    // Barra de progreso como en la web
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    progressBackground: {
        flex: 1,
        height: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primaryPink,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: colors.textLight,
        minWidth: 30,
        textAlign: 'right',
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
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    editButton: {
        padding: 4,
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
        marginTop: 8,
    },
    migrationButton: {
        marginTop: 16
    },
    // Estilos del modal de edición
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 8,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    cancelButton: {
        backgroundColor: colors.lightGray,
    },
    saveButton: {
        backgroundColor: colors.primaryPink,
    },
    deleteButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: colors.textDark,
        fontWeight: '600',
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    headerInfo: {
        alignItems: 'flex-end',
    },
    adminBadge: {
        fontSize: 12,
        color: colors.primaryFuchsia,
        fontWeight: '600',
        backgroundColor: colors.lightPink,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
};