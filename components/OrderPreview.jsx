import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { colors, sizes } from "@/assets/styles";
import CustomButton from "./CustomButton";
import { MaterialIcons } from "@expo/vector-icons";

const OrderPreview = ({ visible, onClose, item, onEdit, onDelete }) => {
  if (!item) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
              <MaterialIcons name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
              <MaterialIcons name="delete" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>Price: R{item.price}</Text>

          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 30, color: colors.danger }}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: colors.primary,
  },
  price: {
    fontSize: 15,
    color: colors.black,
    marginVertical: 10,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    paddingBottom: 10,
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
});

export default OrderPreview;
