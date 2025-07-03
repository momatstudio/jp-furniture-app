import { useEffect, useState, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/assets/styles";

const DEFAULT_REGION = {
  latitude: -25.7479,
  longitude: 28.2293,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapModal({
  locationModalVisible,
  setLocationModalVisible,
  handlePlaceSelect,
  mapRef,
  selectedLocation,
  handleMapPress,
  goToCurrentLocation,
  isLoadingLocation,
  locationAddress,
  verifyLocation,
  isVerifyingLocation,
  confirmLocation,
}) {
  const [error, setError] = useState(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [addressLoading, setAddressLoading] = useState(false);

  // Center map on selected location or default
  useEffect(() => {
    if (selectedLocation) {
      setRegion({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [selectedLocation]);

  // Handle address loading state
  useEffect(() => {
    if (selectedLocation && !locationAddress) {
      setAddressLoading(true);
    } else {
      setAddressLoading(false);
    }
  }, [selectedLocation, locationAddress]);

  // Retry location fetch
  const handleRetry = useCallback(() => {
    setError(null);
    goToCurrentLocation();
  }, [goToCurrentLocation]);

  // Close modal handler
  const handleClose = useCallback(() => {
    setLocationModalVisible(false);
    setError(null);
  }, [setLocationModalVisible]);

  return (
    <Modal
      visible={locationModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Location</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color={colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            loadingEnabled
            loadingIndicatorColor={colors.primary}
            loadingBackgroundColor={colors.white}
            moveOnMarkerPress={false}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                draggable
                onDragEnd={handleMapPress}
                pinColor={colors.primary}
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={goToCurrentLocation}
            disabled={isLoadingLocation}
          >
            <MaterialIcons
              name="my-location"
              size={24}
              color={isLoadingLocation ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          {isLoadingLocation || addressLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.infoText}>Fetching location...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={handleRetry}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.infoText}>
              {locationAddress
                ? `Address: ${locationAddress}`
                : selectedLocation
                ? "Fetching address..."
                : "Tap on the map to select a location."}
            </Text>
          )}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: selectedLocation
                  ? colors.primary
                  : colors.secondary,
              },
            ]}
            onPress={confirmLocation}
            disabled={!selectedLocation}
          >
            <Text
              style={[
                styles.buttonText,
                { color: selectedLocation ? colors.white : colors.gray },
              ]}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.secondary,
  },
  title: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  closeButton: { padding: 4 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  currentLocationButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoContainer: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.white,
  },
  infoText: { fontSize: 15, color: colors.primary, textAlign: "center" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  errorText: { color: colors.danger, fontSize: 15 },
  retryButton: { marginLeft: 10, padding: 4 },
  retryText: { color: colors.primary, fontWeight: "bold" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.white,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
