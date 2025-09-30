// styles/globalStyles.js
import { StyleSheet } from 'react-native';

export const colors = {
  primaryPink: '#E91E63',
  primaryFuchsia: '#C2185B',
  lightPink: '#F8BBD9',
  darkPink: '#AD1457',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#2E2E2E',
  textDark: '#2E2E2E',
  textLight: '#666666',
  error: '#D32F2F',
  success: '#388E3C'
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryFuchsia,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginVertical: 8,
  },
  card: {
    backgroundColor: colors.white,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: colors.primaryPink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.lightPink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondaryText: {
    color: colors.primaryFuchsia,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
});