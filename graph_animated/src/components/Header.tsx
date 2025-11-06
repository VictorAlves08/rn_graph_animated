import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <MaterialCommunityIcons
          name="check-decagram-outline"
          size={20}
          color="white"
        />
        <Text style={styles.badgeText}>STUDY FACT</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Kegel exercises strengthen PF muscles,</Text>
        <Text style={styles.text}>which significantly increases</Text>
        <Text style={styles.text}>
          <Text style={styles.highlight}>ejaculation control.</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    marginTop: 36,
  },
  badge: {
    backgroundColor: "#EE0F0F",
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  textContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    color: "#FFFFFF",
    textAlign: "center",
  },
  highlight: {
    color: "#12B76A",
  },
});

export default Header;
