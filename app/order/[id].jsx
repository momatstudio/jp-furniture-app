import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenTitle from "@/components/ScreenTitle";
import Payment from "@/components/Payment";
import CustomButton from "@/components/CustomButton";
import Title from "@/components/Title";
import AddButton from "@/components/AddButton";
import { useOrders } from "@/context/OrdersContext";
import { colors, sizes, fontWeights, shadows } from "@/assets/styles";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomAlert from "../../components/CustomAlert";
import { StatusBar } from "expo-status-bar";

const formatCurrency = (amount) => `R${parseFloat(amount || 0).toFixed(2)}`;

const Order = () => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertActive, setAlertActive] = useState("");
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [note, setNote] = useState("");
  const [editNoteIndex, setEditNoteIndex] = useState(null);
  const [paymentNumber, setPaymentNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState({
    deposit: false,
    addNote: false,
    archive: false,
    repossess: false,
    delete: false,
    call: false,
    locate: false,
  });
  const { id } = useLocalSearchParams();

  const {
    fetchOrderById,
    loading,
    openGoogleMaps,
    updateOrderPayment,
    repossessOrder,
    deleteOrder,
    archiveOrder,
    addNoteToOrder,
    editNoteInOrder,
    deleteNoteFromOrder,
    clearAllNotesFromOrder,
    addOrderResults,
    makeCall,
  } = useOrders();

  const getOrderDetails = async () => {
    try {
      if (id) {
        const fetchedOrder = await fetchOrderById(id);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          console.log("fetchedOrder", fetchedOrder);
          console.log("Fetched Order:", fetchedOrder);
          const number = fetchedOrder?.payments?.length;
          setPaymentNumber(number);
        } else {
          console.log("Order not found.");
        }
      }
    } catch (error) {
      console.log("Failed to fetch order:", error);
    }
  };
  useEffect(() => {
    getOrderDetails();
  }, [id]);

  const locateHandler = () => {
    openGoogleMaps(
      parseFloat(order?.client?.latitude),
      parseFloat(order?.client?.longitude)
    );
  };

  const repossessHandler = async () => {
    await repossessOrder(id);
    getOrderDetails();
  };

  const archiveHandler = async () => {
    setActionLoading((prev) => ({ ...prev, archive: true }));
    await archiveOrder(id);
    setActionLoading((prev) => ({ ...prev, archive: false }));
    getOrderDetails();
  };

  const deleteHandler = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this order?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setActionLoading((prev) => ({ ...prev, delete: true }));
            await deleteOrder(id);
            setActionLoading((prev) => ({ ...prev, delete: false }));
          },
          style: "destructive",
        },
      ]
    );
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const makeDepositHandler = async () => {
    if (!amount) {
      setAlertActive("Please fill the deposit amount!");
      return;
    }
    setActionLoading((prev) => ({ ...prev, deposit: true }));
    try {
      const paymentAmount = parseFloat(amount);
      const oldPayments = order?.payments || [];
      const totalPaid = oldPayments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount || 0),
        0
      );
      const clientRemainingBalance =
        parseFloat(order?.items[0]?.price || 0) - (totalPaid + paymentAmount);
      const newPayment = {
        paymentNumber: order?.payments?.length + 1,
        amount: paymentAmount,
        date: getCurrentDate(),
        remainingBalance: clientRemainingBalance,
      };

      await updateOrderPayment(order.id, newPayment, oldPayments);

      setOrder((prevOrder) => ({
        ...prevOrder,
        payments: [...oldPayments, newPayment],
        remainingBalance: clientRemainingBalance,
      }));

      setAlertActive("Payment added successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Failed to add payment:", error);
      setAlertActive("Failed to add payment!");
    } finally {
      setActionLoading((prev) => ({ ...prev, deposit: false }));
      setTimeout(() => setAlertActive(""), 4000);
    }
    getOrderDetails();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    clearFieldHandler();
  };

  const clearFieldHandler = () => {
    setPaymentNumber("");
    setAmount("");
  };

  const makeCallHandler = async () => {
    setActionLoading((prev) => ({ ...prev, call: true }));
    await makeCall(order?.client?.cellNumber, order?.client?.cellNumberTwo);
    setActionLoading((prev) => ({ ...prev, call: false }));
  };

  const handleAddNote = async () => {
    if (!note) {
      setAlertActive("Please write a note!");
      setTimeout(() => setAlertActive(""), 4000);
      return;
    }
    setActionLoading((prev) => ({ ...prev, addNote: true }));
    try {
      if (editNoteIndex !== null) {
        await editNoteInOrder(order.id, editNoteIndex, note);
        setOrder((prevOrder) => {
          const updatedNotes = prevOrder.notes.map((n, index) =>
            index === editNoteIndex ? { ...n, text: note } : n
          );
          return { ...prevOrder, notes: updatedNotes };
        });
        setAlertActive("Note edited successfully!");
      } else {
        await addNoteToOrder(order.id, note);
        setOrder((prevOrder) => ({
          ...prevOrder,
          notes: [
            ...(prevOrder.notes || []),
            { text: note, date: new Date().toISOString() },
          ],
        }));
        setAlertActive("Note added successfully!");
      }
      setTimeout(() => setAlertActive(""), 4000);
      setNote("");
      setEditNoteIndex(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Failed to add/edit note:", error);
      setAlertActive("Failed to add/edit note!");
      setTimeout(() => setAlertActive(""), 4000);
    } finally {
      setActionLoading((prev) => ({ ...prev, addNote: false }));
    }
  };

  const handleEditNote = (noteIndex) => {
    setNoteModalVisible(true);
    setEditNoteIndex(noteIndex);
    setNote(order.notes[noteIndex].text);
  };

  const handleDeleteNote = async (noteIndex) => {
    try {
      await deleteNoteFromOrder(order.id, noteIndex);
      setOrder((prevOrder) => ({
        ...prevOrder,
        notes: prevOrder.notes.filter((_, index) => index !== noteIndex),
      }));
    } catch (error) {
      console.error("Failed to delete note:", error);
      setAlertActive("Failed to delete note!");
      setTimeout(() => setAlertActive(""), 4000);
    }
  };

  const handleClearAllNotes = async () => {
    try {
      await clearAllNotesFromOrder(order.id);
      setOrder((prevOrder) => ({
        ...prevOrder,
        notes: [],
      }));
    } catch (error) {
      console.error("Failed to clear notes:", error);
      setAlertActive("Failed to clear notes!");
      setTimeout(() => setAlertActive(""), 4000);
    }
  };
  const formatCurrency = (amount) => `R${parseFloat(amount || 0).toFixed(2)}`;

  if (!order)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          accessibilityLabel="Back"
        >
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
        <ScreenTitle title="Order Details" />
      </View>
      {alertActive && (
        <CustomAlert label={alertActive} color={colors.success} />
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Order Info */}
        <View style={styles.card}>
          <View style={styles.orderInfoRow}>
            <Image
              source={{ uri: order?.items[0]?.imageUrl }}
              style={styles.productImage}
            />
            <View style={styles.orderInfoDetails}>
              <Text style={styles.productTitle}>{order?.items[0]?.title}</Text>
              <Text style={styles.productQtyPrice}>
                {/* {order?.items[0]?.quantity} x{" "} */}
                {formatCurrency(order?.items[0]?.price)}
              </Text>
              {/* <Text style={styles.productTotal}>
                Total: {formatCurrency(order.total)}
              </Text> */}
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              {order?.client?.firstName} {order?.client?.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="calendar-today"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.infoText}>{order?.orderInfo?.orderDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="confirmation-number"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.infoText}>{order?.orderInfo?.orderNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              {order?.client?.primaryPhone}
              {order?.client?.secondaryPhone
                ? `, ${order?.client?.secondaryPhone}`
                : ""}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="location-on"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.infoText}>{order?.client?.address}</Text>
          </View>
        </View>

        {/* Card: Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <Text style={styles.summaryValue}>{order.status}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity:</Text>
            <Text style={styles.summaryValue}>{order?.items[0]?.quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.shipping)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
              Total:
            </Text>
            <Text style={[styles.summaryValue, { fontWeight: "bold" }]}>
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        {/* Card: Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Actions</Text>
          <View style={styles.actionsRow}>
            <View style={styles.actionIconLabel}>
              <CustomButton
                label={
                  actionLoading.addNote ? (
                    <ActivityIndicator color={colors.blue} size="small" />
                  ) : (
                    <MaterialIcons name="note" size={22} color={colors.blue} />
                  )
                }
                backgroundColor={colors.secondary}
                color={colors.black}
                onPress={() => setNoteModalVisible(true)}
                style={styles.actionBtn}
                accessibilityLabel="Notes"
                disabled={actionLoading.addNote}
              />
              <Text style={styles.actionLabel}>Notes</Text>
            </View>
            <View style={styles.actionIconLabel}>
              <CustomButton
                label={
                  actionLoading.call ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <MaterialIcons
                      name="call"
                      size={22}
                      color={colors.primary}
                    />
                  )
                }
                backgroundColor={colors.secondary}
                color={colors.white}
                onPress={makeCallHandler}
                style={styles.actionBtn}
                accessibilityLabel="Call"
                disabled={actionLoading.call}
              />
              <Text style={styles.actionLabel}>Call</Text>
            </View>
            <View style={styles.actionIconLabel}>
              <CustomButton
                label={
                  actionLoading.locate ? (
                    <ActivityIndicator color={colors.black} size="small" />
                  ) : (
                    <MaterialIcons
                      name="location-on"
                      size={22}
                      color={colors.black}
                    />
                  )
                }
                backgroundColor={colors.secondary}
                onPress={locateHandler}
                style={styles.actionBtn}
                accessibilityLabel="Locate"
                disabled={actionLoading.locate}
              />
              <Text style={styles.actionLabel}>Locate</Text>
            </View>
            <View style={styles.actionIconLabel}>
              <CustomButton
                label={
                  actionLoading.archive ? (
                    <ActivityIndicator color={colors.success} size="small" />
                  ) : (
                    <MaterialIcons
                      name="archive"
                      size={22}
                      color={
                        order?.orderInfo?.archived
                          ? colors.white
                          : colors.success
                      }
                    />
                  )
                }
                backgroundColor={colors.secondary}
                onPress={archiveHandler}
                style={styles.actionBtn}
                accessibilityLabel="Archive"
                disabled={actionLoading.archive}
              />
              <Text style={styles.actionLabel}>Archive</Text>
            </View>
            <View style={styles.actionIconLabel}>
              <CustomButton
                label={
                  actionLoading.repossess ? (
                    <ActivityIndicator color={colors.warning} size="small" />
                  ) : (
                    <FontAwesome
                      name="car"
                      size={22}
                      color={
                        order?.orderInfo?.repossessed
                          ? colors.white
                          : colors.warning
                      }
                    />
                  )
                }
                backgroundColor={colors.secondary}
                onPress={repossessHandler}
                style={styles.actionBtn}
                accessibilityLabel="Repossess"
                disabled={actionLoading.repossess}
              />
              <Text style={styles.actionLabel}>Repossess</Text>
            </View>
            <View style={styles.actionIconLabel}>
              <CustomButton
                label={
                  actionLoading.delete ? (
                    <ActivityIndicator color={colors.danger} size="small" />
                  ) : (
                    <MaterialIcons
                      name="delete"
                      size={22}
                      color={colors.danger}
                    />
                  )
                }
                backgroundColor={colors.secondary}
                onPress={deleteHandler}
                style={styles.actionBtn}
                accessibilityLabel="Delete"
                disabled={actionLoading.delete}
              />
              <Text style={styles.actionLabel}>Delete</Text>
            </View>
          </View>
        </View>

        {/* Card: Payments */}
        <View style={styles.card}>
          <View style={styles.paymentsHeaderRow}>
            <Text style={styles.sectionHeader}>Payments</Text>
            <AddButton setModalVisible={setModalVisible} label={"deposit"} />
          </View>
          <FlatList
            data={order?.payments || []}
            renderItem={({ item }) => (
              <Payment
                paymentNumber={item.paymentNumber}
                amount={item.amount}
                date={item.date}
                outstanding={item.remainingBalance}
              />
            )}
            keyExtractor={(item, index) => `${item?.paymentNumber}-${index}`}
            style={styles.paymentsList}
            onRefresh={getOrderDetails}
            refreshing={loading}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyPaymentsText}>No payments yet.</Text>
            }
          />
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Settled</Text>
              <Text style={styles.balanceValue}>
                {formatCurrency(
                  order?.items[0]?.price -
                    order?.payments[order?.payments?.length - 1]
                      ?.remainingBalance || 0
                )}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Remaining</Text>
              <Text style={styles.balanceValue}>
                {formatCurrency(
                  order?.payments[order?.payments?.length - 1]
                    ?.remainingBalance || 0
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal: Add Payment */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.cancelButton}
              accessibilityLabel="Close Payment Modal"
            >
              <Text style={{ fontSize: 30, color: colors.danger }}>×</Text>
            </TouchableOpacity>
            <Title title="Make A Payment Record" />
            {alertActive && (
              <CustomAlert color={colors.danger} label={alertActive} />
            )}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount"
                style={styles.input}
                keyboardType="number-pad"
                accessibilityLabel="Amount"
              />
            </View>
            <CustomButton
              label={
                actionLoading.deposit ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  "Send Deposit"
                )
              }
              onPress={makeDepositHandler}
              backgroundColor={colors.primary}
              style={styles.submitButton}
              disabled={actionLoading.deposit}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Notes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(!noteModalVisible)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <TouchableOpacity
              onPress={() => setNoteModalVisible(false)}
              style={styles.cancelButton}
              accessibilityLabel="Close Notes Modal"
            >
              <Text style={{ fontSize: 30, color: colors.danger }}>×</Text>
            </TouchableOpacity>
            {addOrderResults && (
              <CustomAlert color={colors.success} label={addOrderResults} />
            )}
            <Title title="Order Notes" />
            <Text style={styles.sectionHeader}>Notes</Text>
            <FlatList
              data={order?.notes || []}
              renderItem={({ item, index }) => (
                <View style={styles.noteItemImproved}>
                  <View style={styles.noteTextContainer}>
                    <Text style={styles.noteText}>{item.text}</Text>
                    <Text style={styles.noteDate}>
                      {new Date(item.date).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.noteButtonsContainer}>
                    <TouchableOpacity
                      style={styles.editNoteButton}
                      onPress={() => handleEditNote(index)}
                      accessibilityLabel="Edit Note"
                    >
                      <MaterialIcons name="edit" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteNoteButton}
                      onPress={() => handleDeleteNote(index)}
                      accessibilityLabel="Delete Note"
                    >
                      <MaterialIcons name="delete" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => `${index}`}
              style={styles.notesContainer}
              ListEmptyComponent={
                <Text style={styles.emptyNotesText}>No notes yet.</Text>
              }
            />
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Add/Edit Note</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Write your note here"
                style={styles.noteInput}
                maxLength={200}
                multiline
                accessibilityLabel="Note Input"
              />
              <Text style={styles.noteCharCount}>{note.length}/200</Text>
            </View>
            <CustomButton
              label={
                actionLoading.addNote ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : editNoteIndex !== null ? (
                  "Edit Note"
                ) : (
                  "Add Note"
                )
              }
              onPress={handleAddNote}
              backgroundColor={colors.primary}
              style={styles.submitButton}
              disabled={actionLoading.addNote}
              accessibilityLabel={
                editNoteIndex !== null ? "Edit Note" : "Add Note"
              }
            />
            <CustomButton
              label="Clear All Notes"
              onPress={() =>
                Alert.alert(
                  "Clear All Notes",
                  "Are you sure you want to delete all notes?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: handleClearAllNotes,
                    },
                  ]
                )
              }
              backgroundColor={colors.secondary}
              color={colors.black}
              style={styles.noteActionButton}
              accessibilityLabel="Clear All Notes"
              disabled={actionLoading.addNote}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default Order;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: sizes.padding,
  },
  scrollContent: {
    paddingBottom: sizes.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sizes.s,
    marginTop: sizes.s,
  },
  headerBackBtn: {
    marginRight: sizes.s,
    padding: sizes.xs / 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: sizes.radius + 4,
    padding: sizes.padding,
    marginBottom: sizes.m,
    ...shadows.card,
  },
  orderInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sizes.s,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: sizes.radius,
    marginRight: sizes.s,
    backgroundColor: colors.lightGray,
  },
  orderInfoDetails: {
    flex: 1,
  },
  productTitle: {
    fontWeight: fontWeights.bold,
    fontSize: sizes.l,
    color: colors.primary,
    marginBottom: 2,
  },
  productQtyPrice: {
    fontSize: sizes.m,
    color: colors.black,
    marginBottom: 2,
  },
  productTotal: {
    fontWeight: fontWeights.bold,
    color: colors.success,
    fontSize: sizes.m,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: sizes.sm,
    color: colors.black,
    marginLeft: 4,
  },
  sectionHeader: {
    fontWeight: fontWeights.bold,
    fontSize: sizes.l,
    color: colors.primary,
    marginBottom: sizes.xs,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  summaryLabel: {
    color: colors.black,
    fontSize: sizes.sm,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: sizes.sm,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
    justifyContent: "space-between",
  },
  actionIconLabel: {
    alignItems: "center",
    width: 70,
    marginVertical: 4,
  },
  actionLabel: {
    fontSize: sizes.xs + 4,
    color: colors.primary,
    marginTop: 2,
    textAlign: "center",
  },
  paymentsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: sizes.xs,
  },
  paymentsList: {
    marginBottom: sizes.xs,
  },
  emptyPaymentsText: {
    color: colors.gray,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: sizes.xs + 2,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: sizes.radius - 2,
    padding: sizes.s,
    marginTop: sizes.xs,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  balanceLabel: {
    color: colors.white,
    fontWeight: fontWeights.bold,
    fontSize: sizes.sm,
  },
  balanceValue: {
    color: colors.white,
    fontSize: sizes.sm,
    fontWeight: fontWeights.bold,
  },
  // Modal styles
  modalKeyboardAvoid: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  modalCard: {
    padding: sizes.padding,
    width: "96%",
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    borderRadius: sizes.radius + 6,
    backgroundColor: colors.card,
    ...shadows.modal,
    flex: 1,
  },
  cancelButton: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 2,
    marginTop: 2,
  },
  inputRow: {
    marginBottom: sizes.s,
  },
  inputLabel: {
    fontWeight: fontWeights.medium,
    fontSize: sizes.sm,
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 2,
  },
  input: {
    paddingHorizontal: sizes.xs,
    fontSize: sizes.m,
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: sizes.radius - 4,
    minHeight: 44,
    borderWidth: sizes.border,
    borderColor: colors.lightGray,
    marginTop: 2,
  },
  submitButton: {
    marginTop: sizes.m,
    borderRadius: sizes.radius - 2,
    minHeight: 48,
  },
  // Notes styles
  notesContainer: {
    marginVertical: sizes.xs + 2,
  },
  noteItemImproved: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: sizes.xs + 2,
    paddingHorizontal: sizes.xs + 2,
    marginVertical: 4,
    backgroundColor: colors.secondary,
    borderRadius: sizes.radius - 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
    elevation: 1,
  },
  noteTextContainer: {
    flex: 1,
  },
  noteText: {
    fontSize: sizes.m,
    color: colors.black,
  },
  noteDate: {
    fontSize: sizes.xs + 4,
    color: colors.gray,
    marginTop: 2,
  },
  noteButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  editNoteButton: {
    backgroundColor: colors.info,
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteNoteButton: {
    backgroundColor: colors.danger,
    padding: 5,
    borderRadius: 5,
  },
  noteInput: {
    paddingHorizontal: sizes.xs,
    paddingVertical: sizes.xs,
    fontSize: sizes.m,
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: sizes.radius - 4,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginTop: 4,
  },
  noteCharCount: {
    alignSelf: "flex-end",
    fontSize: sizes.xs + 2,
    color: colors.gray,
    marginTop: 2,
    marginRight: 4,
  },
  noteModalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: sizes.s,
    gap: 10,
  },
  noteActionButton: {
    flex: 1,
    marginHorizontal: 2,
    minHeight: 44,
    borderRadius: sizes.radius - 2,
  },
  emptyNotesText: {
    color: colors.gray,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: sizes.xs + 2,
  },
  emptyNotesText: {
    color: colors.gray,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
});
