import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/config/googleMaps";
import { colors } from "@/assets/styles";
import { MaterialIcons } from "@expo/vector-icons";

const INITIAL_REGION = {
  latitude: -26.2041,
  longitude: 28.0473,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

function MapModal({
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
  const initialRegion = selectedLocation
    ? { ...INITIAL_REGION, ...selectedLocation }
    : INITIAL_REGION;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={locationModalVisible}
      onRequestClose={() => setLocationModalVisible(false)}
    >
      <View style={styles.mapContainer}>
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search location"
            minLength={2}
            enablePoweredByContainer={false}
            fetchDetails={true}
            onFail={(error) => console.error(error)}
            onNotFound={() => console.log("no results")}
            onPress={(data, details = null) => {
              if (!details?.geometry?.location) {
                Alert.alert("Error", "Location details not found");
                return;
              }
              handlePlaceSelect(details);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: "en",
              components: "country:za",
            }}
            GooglePlacesSearchQuery={{
              rankby: "distance",
            }}
            GooglePlacesDetailsQuery={{
              fields: ["geometry", "formatted_address"],
            }}
            styles={googlePlacesStyles}
            debounce={200}
            timeout={15000}
            nearbyPlacesAPI="GooglePlacesSearch"
          />
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
        >
          {selectedLocation && (
            <Marker coordinate={selectedLocation} pinColor="red" />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={goToCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons
              name="my-location"
              size={24}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>

        <View style={styles.mapControls}>
          <Text style={styles.addressText}>{locationAddress}</Text>
          <View style={styles.mapButtons}>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: colors.danger }]}
              onPress={() => setLocationModalVisible(false)}
            >
              <Text style={styles.mapButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: colors.warning }]}
              onPress={verifyLocation}
              disabled={isVerifyingLocation || !selectedLocation}
            >
              <Text style={styles.mapButtonText}>
                {isVerifyingLocation ? "Verifying..." : "Verify Location"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: colors.primary }]}
              onPress={confirmLocation}
            >
              <Text style={styles.mapButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default MapModal;

const googlePlacesStyles = {
  container: {
    flex: 0,
    width: "100%",
    zIndex: 999,
  },
  textInput: {
    height: 45,
    color: "#000",
    fontSize: 16,
    backgroundColor: "#f3f3f3",
  },
  predefinedPlacesDescription: {
    color: "#1faadb",
  },
  listView: {
    backgroundColor: "white",
    marginTop: 2,
    borderRadius: 5,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: "row",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
  },
  inputView: {
    borderBottomWidth: 2,
    borderColor: "black",
    paddingVertical: 10,
    margin: 10,
  },
  text1: {
    fontWeight: "900",
    fontSize: 15,
  },
  modalStyle: {
    padding: 10,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  noItemsText: {
    marginTop: 20,
    fontSize: 18,
    color: "gray",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  filterButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  selectedFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.black,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectLocationButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 5,
  },
  selectLocationText: {
    color: colors.white,
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
  },
  mapButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  mapButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 3,
    alignItems: "center",
  },
  mapButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 16,
    marginBottom: 10,
  },
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentLocationButton: {
    position: "absolute",
    right: 15,
    bottom: 150,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  printButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
});
