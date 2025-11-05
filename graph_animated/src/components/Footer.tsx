import Octicons from "@expo/vector-icons/Octicons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const Footer = () => {
  return (
    <View style={styles.container}>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#1aee0f" }]} />
          <Text style={styles.legendText}>With Kegels</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#ee0f0f" }]} />
          <Text style={styles.legendText}>No Kegels</Text>
        </View>
      </View>
      <View style={styles.sourceContainer}>
        <View
          style={{
            backgroundColor: "#000000",
            padding: 8,
            borderRadius: 12,
            gap: 8,
          }}
        >
          <Octicons name="diamond" size={20} color="white" />
        </View>
        <View>
          <Text style={styles.sourceLabel}>Source:</Text>
          <Text style={styles.sourceText}>Sapienza University</Text>
        </View>
      </View>
      <View style={styles.bottomSheet}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>I got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  legendContainer: {
    backgroundColor: "#020c01",
    borderWidth: 1,
    borderColor: "#141518",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  sourceContainer: {
    backgroundColor: "#16191D",
    borderWidth: 1,
    borderColor: "#141518",
    borderRadius: 16,
    padding: 16,
    paddingLeft: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
  },
  sourceLabel: {
    color: "#717680",
    fontSize: 14,
  },
  sourceText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  bottomSheet: {
    backgroundColor: "#090c0e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginTop: 64,
  },
  button: {
    backgroundColor: "#FF0000",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Footer;
