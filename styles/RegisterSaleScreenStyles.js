import { StyleSheet } from 'react-native';
import { colors, globalStyles } from './globalStyles';

export const registerSaleStyles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
        textAlign: 'center',
        marginBottom: 30,
    },
    formSection: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    searchContainer: {
        position: 'relative',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: colors.textDark,
    },
    clearButton: {
        padding: 4,
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        marginTop: 4,
        maxHeight: 200,
        zIndex: 9999,          // Aumentar mucho el zIndex
        elevation: 20,          // Elevar más que otros componentes
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,     // Hacer sombra más visible
        shadowRadius: 6,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    productItemSelected: {
        backgroundColor: colors.lightPink,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 2,
    },
    productDetails: {
        fontSize: 12,
        color: colors.textLight,
    },
    productDescription: {
        fontSize: 11,
        color: colors.textLight,
        fontStyle: 'italic',
        marginTop: 2,
    },
    noResultsText: {
        textAlign: 'center',
        padding: 20,
        color: colors.textLight,
    },
    noProductSelectedText: {
        textAlign: 'center',
        color: colors.textLight,
        fontStyle: 'italic',
        marginTop: 12,
        fontSize: 14,
    },
    selectedProduct: {
        marginTop: 12,
    },
    selectedProductLabel: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 4,
    },
    selectedProductInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightPink,
        padding: 12,
        borderRadius: 8,
    },
    selectedProductName: {
        flex: 1,
        marginLeft: 8,
        fontWeight: '600',
        color: colors.textDark,
    },
    changeProductButton: {
        padding: 4,
    },
    changeProductText: {
        color: colors.primaryPink,
        fontWeight: '600',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    quantityInputContainer: {
        flex: 1,
    },
    quantityInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryPink,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    addButtonDisabled: {
        backgroundColor: colors.mediumGray,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    productInfoCard: {
        backgroundColor: colors.lightPink,
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    productInfoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 8,
    },
    productInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    productInfoLabel: {
        fontSize: 12,
        color: colors.textDark,
    },
    productInfoValue: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textDark,
    },
    saleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        marginBottom: 8,
    },
    saleItemInfo: {
        flex: 1,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 12,
    },
    quantityButton: {
        backgroundColor: colors.primaryPink,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: colors.error,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 20,
        textAlign: 'center',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    paymentButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.primaryPink,
        gap: 8,
    },
    paymentButtonActive: {
        backgroundColor: colors.primaryPink,
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primaryPink,
    },
    paymentButtonTextActive: {
        color: colors.white,
    },
    imageSection: {
        marginTop: 16,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryPink,
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    imageButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 12,
    },
    totalSection: {
        backgroundColor: colors.primaryFuchsia,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        color: colors.white,
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 32,
        color: colors.white,
        fontWeight: 'bold',
        marginTop: 8,
    },
    itemsCount: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 4,
    },
    buttonDisabled: {
        backgroundColor: colors.mediumGray,
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
    },
});