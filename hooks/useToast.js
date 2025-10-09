import { useState } from 'react';
import { Alert } from 'react-native';

export const useToast = () => {
  const showToast = (type, title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  return { showToast };
};