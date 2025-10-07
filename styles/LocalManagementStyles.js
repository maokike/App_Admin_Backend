import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

export const localManagementStyles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryPink,
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
  listContainer: {
    padding: 16,
    gap: 12,
  },
  localCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  localHeader: {
    marginBottom: 12,
  },
  localInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  localDetails: {
    flex: 1,
  },
  localName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  localAddress: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  localPhone: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  localUser: {
    fontSize: 12,
    color: colors.primaryPink,
    fontWeight: '600',
  },
  localActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.primaryPink,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textLight,
    fontSize: 14,
  },
  inventoryButton: {
    backgroundColor: colors.success,
},
localId: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
},
debugButton: {
    backgroundColor: colors.primaryPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
},
debugButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
},
});