import BleManager from "react-native-ble-manager";

// BleManager.start({ showAlert: false });

export const initBLE = async () => {
  try {
    await BleManager.start({ showAlert: false });
  } catch (error) {
    console.error("Initialization error", error);
  }
};

export const bleManager = BleManager;
