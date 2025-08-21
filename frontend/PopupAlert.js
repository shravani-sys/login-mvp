// PopupAlert.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PopupAlert = ({
  visible,
  title,
  message,
  onClose,
  buttonText = 'OK',
  buttonAction = null,
  type = 'default',
  secondButtonText,
  secondButtonAction,
}) => {
  const getColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'info': return '#2196F3';
      default: return '#6a1b9a';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { borderColor: getColor(), shadowColor: getColor() }]}>
          <Text style={[styles.title, { color: getColor() }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getColor() }]}
            onPress={() => {
              if (buttonAction) buttonAction();
              else onClose();
            }}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>

          {secondButtonText && secondButtonAction && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#aaa', marginTop: 10 }]}
              onPress={secondButtonAction}
            >
              <Text style={styles.buttonText}>{secondButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PopupAlert;

//  Style Improvements: Smaller, center-aligned, 
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 250,
    maxWidth: 320, //max width to avoid stretching
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
    color: '#444',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
