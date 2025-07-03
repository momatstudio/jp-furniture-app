import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  LogBox,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  MapModal,
  Header,
  ScreenTitle,
  Order,
  CustomButton,
  Picker,
  Title,
  CustomAlert,
  Search,
  FilterByDates,
} from "@/components";
import { useOrders } from "@/context/";
import { colors } from "@/assets/styles";
import { StatusBar } from "expo-status-bar";
import { generatePDF } from "../../utils/pdfGenerator";
// import { debounce } from "lodash";
import {
  clearFormData,
  createOrderFromForm,
  filterByDate,
  filterByType,
  searchInOrder,
  validateForm,
} from "@/actions";

const Orders = () => {
  const { orders, fetchOrders, addOrder, addOrderResults } = useOrders();

  const [formState, setFormState] = useState(clearFormData);
  const [locationState, setLocationState] = useState({
    modalVisible: false,
    selectedLocation: null,
    address: "",
    isLoading: false,
    isVerifying: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Ignore common warning
  useEffect(() => {
    const unsubscribe = LogBox.ignoreLogs([
      "VirtualizedLists should never be nested",
    ]);
    return () => unsubscribe;
  }, []);

  // Memoized filters
  const filters = useMemo(
    () => ({ searchQuery, selectedDate, filterType }),
    [searchQuery, selectedDate, filterType]
  );

  const uniqueDates = useMemo(() => {
    const dates = orders.map((order) => order.client.preferredPaymentDate);
    return [...new Set(dates)].sort((a, b) => Number(a) - Number(b));
  }, [orders]);

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          searchInOrder(order, filters.searchQuery) &&
          filterByDate(order, filters.selectedDate) &&
          filterByType(order, filters.filterType)
      ),
    [orders, filters]
  );

  // --- Location/Map Modal Logic ---
  // Permission check
  const checkLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        return newStatus === "granted";
      }
      return true;
    } catch (error) {
      Alert.alert("Permission Error", "Could not check location permissions.");
      return false;
    }
  }, []);

  // Get address with timeout and retry
  const getAddressFromCoords = useCallback(
    async (latitude, longitude, retryCount = 0) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await Promise.race([
          Location.reverseGeocodeAsync({ latitude, longitude }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Geocoding timeout")), 10000)
          ),
        ]);
        clearTimeout(timeoutId);
        if (response?.[0]) {
          return `${response[0].street || ""}, ${response[0].city || ""}, ${
            response[0].region || ""
          }`;
        }
        return "";
      } catch (error) {
        if (retryCount < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          return getAddressFromCoords(latitude, longitude, retryCount + 1);
        }
        return "Location unavailable";
      }
    },
    []
  );

  // Open map modal and get current location
  const handleLocationPress = useCallback(async () => {
    if (locationState.isLoading) return;
    setLocationState((prev) => ({ ...prev, isLoading: true }));
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setLocationState((prev) => ({ ...prev, isLoading: false }));
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      setLocationState((prev) => ({ ...prev, modalVisible: true }));
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
        timeout: 15000,
        maxAge: 60000,
      });
      const { latitude, longitude } = location.coords;
      setLocationState((prev) => ({
        ...prev,
        selectedLocation: { latitude, longitude },
        isLoading: false,
      }));
      // Fetch address in background
      getAddressFromCoords(latitude, longitude).then((address) => {
        setLocationState((prev) => ({
          ...prev,
          address,
        }));
      });
    } catch (error) {
      setLocationState((prev) => ({ ...prev, isLoading: false }));
      Alert.alert(
        "Error",
        "Unable to fetch location. Please try again or enter address manually."
      );
    }
  }, [locationState.isLoading, checkLocationPermission, getAddressFromCoords]);

  // Confirm location from modal
  const handleLocationConfirm = useCallback(() => {
    const { selectedLocation, address } = locationState;
    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location first");
      return;
    }
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
        address: address,
      },
    }));
    setLocationState((prev) => ({ ...prev, modalVisible: false }));
  }, [locationState]);

  // Handle map modal close
  const handleMapModalClose = useCallback(() => {
    setLocationState((prev) => ({
      ...prev,
      modalVisible: false,
      isLoading: false,
      isVerifying: false,
    }));
  }, []);

  // Handle place select from search
  const handlePlaceSelect = useCallback(
    async (details) => {
      if (!details?.geometry?.location) return;
      const { lat, lng } = details.geometry.location;
      setLocationState((prev) => ({
        ...prev,
        selectedLocation: { latitude: lat, longitude: lng },
      }));
      const address = await getAddressFromCoords(lat, lng);
      setLocationState((prev) => ({
        ...prev,
        address,
      }));
    },
    [getAddressFromCoords]
  );

  // Handle map press
  const handleMapPress = useCallback(
    async (event) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setLocationState((prev) => ({
        ...prev,
        selectedLocation: { latitude, longitude },
      }));
      const address = await getAddressFromCoords(latitude, longitude);
      setLocationState((prev) => ({
        ...prev,
        address,
      }));
    },
    [getAddressFromCoords]
  );

  // --- Form and List Logic ---
  const handleFormSubmit = async () => {
    console.log("DEBUG selectedItem:", formState.data.selectedItem);
    if (!validateForm(formState.data)) {
      setFormState((prev) => ({
        ...prev,
        errors: "Please fill all required fields",
      }));
      return;
    }
    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const newOrder = createOrderFromForm(formState.data);
      await addOrder(newOrder);
      setFormState(clearFormData);
      setModalVisible(false);
    } catch (error) {
      setFormState((prev) => ({ ...prev, errors: error.message }));
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDateFilter = useCallback(
    (date) => setSelectedDate(date === selectedDate ? null : date),
    [selectedDate]
  );

  const handleFilterTypeChange = useCallback((type) => setFilterType(type), []);

  const typeOfFilterHandler = () => {
    if (filterType === "All") return "All Orders";
    if (filterType === "Active") return "Active Orders";
    if (filterType === "Repossessed") return "Repossessed Orders";
    if (filterType === "Archived") return "Archived Orders";
    if (filterType === "Paid") return "Paid Orders";
    if (filterType === "Unpaid") return "Unpaid Orders";
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      await generatePDF(filteredOrders, typeOfFilterHandler(), selectedDate);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper for order summary preview
  const getOrderSummary = () => {
    const item = formState.data.selectedItem;
    const quantity = formState.data.quantity
      ? parseInt(formState.data.quantity, 10)
      : 1;
    const price = item?.price ? parseFloat(item.price) : 0;
    const shipping = 0;
    const subtotal = price * quantity;
    const tax = 0;
    const total = subtotal + shipping + tax;
    return {
      item,
      quantity,
      price,
      shipping,
      subtotal,
      tax,
      total,
      status: "Pending",
    };
  };

  // --- Render ---
  return (
    <>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Header showAlarmIcon={true} />
        <ScreenTitle
          title="ORDERS"
          buttonLabel="order"
          showButton={true}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
        <View style={styles.section}>
          <Search
            placeholder={"Search orders..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {addOrderResults && (
          <CustomAlert label={addOrderResults} color={colors.success} />
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter By Dates</Text>
          <View
            style={{ flexDirection: "row", width: "100%", paddingBottom: 10 }}
          >
            <FilterByDates
              date="All"
              backgroundColor={
                !selectedDate ? colors.primary : colors.secondary
              }
              color={!selectedDate ? colors.white : colors.black}
              onPress={() => handleDateFilter(null)}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {uniqueDates.map((date) => (
                <FilterByDates
                  key={date}
                  date={date}
                  backgroundColor={
                    selectedDate === date ? colors.primary : colors.secondary
                  }
                  color={selectedDate === date ? colors.white : colors.black}
                  onPress={() => handleDateFilter(date)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter By</Text>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {/* Filter by variations  */}
            <FilterByDates
              date={
                <MaterialIcons
                  name="list"
                  size={20}
                  color={filterType === "All" ? colors.white : colors.primary}
                />
              }
              backgroundColor={
                filterType === "All" ? colors.primary : colors.secondary
              }
              color={filterType === "All" ? colors.white : colors.black}
              onPress={() => handleFilterTypeChange("All")}
            />
            <FilterByDates
              date={
                <MaterialIcons
                  name="filter-list"
                  size={20}
                  color={filterType === "Active" ? colors.white : colors.purple}
                />
              }
              backgroundColor={
                filterType === "Active" ? colors.primary : colors.secondary
              }
              color={filterType === "Active" ? colors.white : colors.black}
              onPress={() => handleFilterTypeChange("Active")}
            />
            <FilterByDates
              date={
                <MaterialIcons
                  name="archive"
                  size={20}
                  color={
                    filterType === "Archived" ? colors.white : colors.success
                  }
                />
              }
              backgroundColor={
                filterType === "Archived" ? colors.primary : colors.secondary
              }
              color={filterType === "Archived" ? colors.white : colors.black}
              onPress={() => handleFilterTypeChange("Archived")}
            />
            <FilterByDates
              date={
                <FontAwesome
                  name="car"
                  size={20}
                  color={
                    filterType === "Repossessed" ? colors.white : colors.warning
                  }
                />
              }
              backgroundColor={
                filterType === "Repossessed" ? colors.primary : colors.secondary
              }
              color={filterType === "Repossessed" ? colors.white : colors.black}
              onPress={() => handleFilterTypeChange("Repossessed")}
            />
            <FilterByDates
              date={
                <MaterialIcons
                  name="paid"
                  size={20}
                  color={filterType === "Paid" ? colors.white : colors.info}
                />
              }
              backgroundColor={
                filterType === "Paid" ? colors.primary : colors.secondary
              }
              color={filterType === "Paid" ? colors.white : colors.black}
              onPress={() => handleFilterTypeChange("Paid")}
            />
            <FilterByDates
              date={
                <MaterialIcons
                  name="money-off"
                  size={20}
                  color={filterType === "Unpaid" ? colors.white : colors.danger}
                />
              }
              backgroundColor={
                filterType === "Unpaid" ? colors.primary : colors.secondary
              }
              color={filterType === "Unpaid" ? colors.white : colors.black}
              onPress={() => handleFilterTypeChange("Unpaid")}
            />
          </View>
          <Text style={styles.filterTypeLabel}>{typeOfFilterHandler()}</Text>
        </View>
        {/* display orders */}
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <Order orderDetails={item} />}
          keyExtractor={(item) => item.id}
          getItemLayout={(data, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          initialNumToRender={10}
          contentContainerStyle={styles.orders}
          refreshing={loading}
          onRefresh={fetchOrders}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="sad-outline"
                size={100}
                color={colors.secondary}
              />
              <Text style={styles.noItemsText}>No Orders</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.printButton}
          onPress={handleGeneratePDF}
          disabled={loading}
          accessibilityLabel="Export Orders as PDF"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="print" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
      {/* --- Add New Order Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Title title="Create New Order" />
            {formState.errors && (
              <CustomAlert label={formState.errors} color={colors.danger} />
            )}
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.formSectionTitle}>Customer Information</Text>
              <View style={styles.cardSection}>
                {/* First Name */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    value={formState.data.firstName}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, firstName: text },
                      }))
                    }
                    placeholder="Client name"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                    accessibilityLabel="First Name"
                  />
                </View>
                {/* Last Name */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    value={formState.data.lastName}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, lastName: text },
                      }))
                    }
                    placeholder="Client surname"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                    accessibilityLabel="Last Name"
                  />
                </View>
                {/* Primary Phone */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Cell Number 1 *</Text>
                  <TextInput
                    value={formState.data.primaryPhone}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, primaryPhone: text },
                      }))
                    }
                    placeholder="Client cell number"
                    style={styles.input}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    accessibilityLabel="Primary Phone"
                  />
                </View>
                {/* Secondary Phone */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Cell Number 2</Text>
                  <TextInput
                    value={formState.data.secondaryPhone}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, secondaryPhone: text },
                      }))
                    }
                    placeholder="Client cell number"
                    style={styles.input}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    accessibilityLabel="Secondary Phone"
                  />
                </View>
                {/* Address */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Physical Address *</Text>
                  <View style={styles.locationContainer}>
                    <TextInput
                      value={formState.data.address}
                      onChangeText={(text) =>
                        setFormState((prev) => ({
                          ...prev,
                          data: { ...formState.data, address: text },
                        }))
                      }
                      placeholder="Client address"
                      style={[styles.input, { flex: 1 }]}
                      returnKeyType="next"
                      accessibilityLabel="Address"
                    />
                    <TouchableOpacity
                      style={styles.selectLocationButton}
                      onPress={handleLocationPress}
                      accessibilityLabel="Locate Address"
                    >
                      <Text style={styles.selectLocationText}>Locate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* City */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    value={formState.data.city}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, city: text },
                      }))
                    }
                    placeholder="e.g Mabopane"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                    accessibilityLabel="City"
                  />
                </View>
                {/* Region */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Region *</Text>
                  <TextInput
                    value={formState.data.region}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, region: text },
                      }))
                    }
                    placeholder="e.g zone 1"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                    accessibilityLabel="Region"
                  />
                </View>
                {/* Postal Code */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Postal Code *</Text>
                  <TextInput
                    value={formState.data.postalCode}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, postalCode: text },
                      }))
                    }
                    placeholder="e.g 0001"
                    style={styles.input}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    accessibilityLabel="Postal Code"
                  />
                </View>
                {/* Preferred Payment Date */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>
                    Preferred Payment Date *
                  </Text>
                  <TextInput
                    value={formState.data.preferredPaymentDate}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, preferredPaymentDate: text },
                      }))
                    }
                    placeholder="Preferred payment date"
                    style={styles.input}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    accessibilityLabel="Preferred Payment Date"
                  />
                </View>
              </View>

              <Text style={styles.formSectionTitle}>Order Details</Text>
              <View style={styles.cardSection}>
                {/* Picker */}
                <View style={styles.inputRow}>
                  <Picker
                    setSelectedItem={(item) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, selectedItem: item },
                      }))
                    }
                    error={
                      formState.errors &&
                      (!formState.data.selectedItem ||
                        !formState.data.selectedItem.id)
                        ? "Please select an item"
                        : undefined
                    }
                  />
                </View>
                {/* Quantity */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    value={formState.data.quantity?.toString() || ""}
                    onChangeText={(text) =>
                      setFormState((prev) => ({
                        ...prev,
                        data: { ...formState.data, quantity: text },
                      }))
                    }
                    placeholder="Quantity"
                    style={styles.input}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    accessibilityLabel="Quantity"
                  />
                </View>
              </View>

              {/* --- Order Summary Preview --- */}
              <Text style={styles.formSectionTitle}>Order Summary</Text>
              <View style={styles.orderSummaryCard}>
                {(() => {
                  const summary = getOrderSummary();
                  return (
                    <>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Item:</Text>
                        <Text style={styles.summaryValue}>
                          {summary.item?.title || "-"}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Quantity:</Text>
                        <Text style={styles.summaryValue}>
                          {summary.quantity}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Price:</Text>
                        <Text style={styles.summaryValue}>
                          R{summary.price.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>
                          R{summary.subtotal.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping:</Text>
                        <Text style={styles.summaryValue}>
                          R{summary.shipping.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax:</Text>
                        <Text style={styles.summaryValue}>
                          R{summary.tax.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text
                          style={[styles.summaryLabel, { fontWeight: "bold" }]}
                        >
                          Total:
                        </Text>
                        <Text
                          style={[styles.summaryValue, { fontWeight: "bold" }]}
                        >
                          R{summary.total.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Status:</Text>
                        <Text style={styles.summaryValue}>
                          {summary.status}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
              {/* --- End Order Summary Preview --- */}

              <CustomButton
                label={
                  formState.isSubmitting ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    "Place Order"
                  )
                }
                onPress={handleFormSubmit}
                backgroundColor={colors.primary}
                disabled={formState.isSubmitting}
                style={styles.submitButton}
                accessibilityLabel="Place Order"
              />
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
              accessibilityLabel="Close Modal"
            >
              <Text style={{ fontSize: 30, color: colors.danger }}>×</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- Map Modal --- */}
      <MapModal
        locationModalVisible={locationState.modalVisible}
        setLocationModalVisible={handleMapModalClose}
        handlePlaceSelect={handlePlaceSelect}
        mapRef={mapRef}
        selectedLocation={locationState.selectedLocation}
        handleMapPress={handleMapPress}
        goToCurrentLocation={handleLocationPress}
        isLoadingLocation={locationState.isLoading}
        locationAddress={locationState.address}
        verifyLocation={handleLocationPress}
        isVerifyingLocation={locationState.isVerifying}
        confirmLocation={handleLocationConfirm}
      />
    </>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f7f7fa",
    padding: 15,
  },
  section: {
    width: "100%",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
    marginLeft: 2,
  },
  filterTypeLabel: {
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 2,
    marginLeft: 2,
  },
  formSectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  inputView: {
    borderBottomWidth: 1,
    borderColor: "gray",
    paddingVertical: 8,
    marginVertical: 6,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 1,
  },
  input: {
    paddingHorizontal: 4,
    fontSize: 15,
    color: colors.black,
    backgroundColor: "#fff",
    borderRadius: 4,
    minHeight: 40,
  },
  text1: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
    color: colors.primary,
  },
  modalKeyboardAvoid: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  modalCard: {
    padding: 16,
    width: "96%",
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    flex: 1,
  },
  formScroll: {
    paddingBottom: 30,
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 8,
  },
  submitButton: {
    marginTop: 18,
    borderRadius: 8,
    minHeight: 48,
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
    marginLeft: 6,
  },
  selectLocationText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
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
  cardSection: {
    backgroundColor: "#f6f7fb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    marginTop: 4,
    elevation: 1,
  },
  inputRow: {
    marginBottom: 10,
  },
  inputLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 2,
  },
  orderSummaryCard: {
    backgroundColor: "#f6f7fb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    marginTop: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  summaryLabel: {
    color: colors.black,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 14,
  },
});
