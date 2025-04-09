import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import UserList from "../../components/userList";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ItemModal() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0); // key to reload UserList

  const database = useSQLiteContext();

  React.useEffect(() => {
    const setupTable = async () => {
      try {
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            image TEXT
          );
        `);
        console.log("✅ Users table ready");
      } catch (e) {
        console.error("Error creating users table:", e);
      }
    };

    setupTable();
  }, []);

  React.useEffect(() => {
    if (id) {
      setEditMode(true);
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const result = await database.getFirstAsync<{
      id: number;
      name: string;
      email: string;
    }>(`SELECT * FROM users WHERE id = ?`, [parseInt(id as string)]);
    if (result) {
      setName(result.name);
      setEmail(result.email);
    }
  };

  const handleSave = async () => {
    try {
      await database.runAsync(
        `INSERT INTO users (name, email, image) VALUES (?, ?, ?)`,
        [name, email, ""]
      );
      console.log("Item saved successfully");
      setRefreshSignal(prev => prev + 1); // refresh the list
      resetForm();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await database.runAsync(
        `UPDATE users SET name = ?, email = ? WHERE id = ?`,
        [name, email, parseInt(id as string)]
      );
      console.log("Item updated successfully");
      setRefreshSignal(prev => prev + 1); // refresh the list
      resetForm();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleResetDatabase = async () => {
    try {
      await database.runAsync(`DELETE FROM users`);
      console.log("Database reset");
      setRefreshSignal(prev => prev + 1); // refresh the list
    } catch (e) {
      console.error("Error resetting DB:", e);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setEditMode(false);
    //router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Item Modal" }} />
      <View style={{ gap: 20, marginVertical: 20 }}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.textInput}
        />
        <TextInput
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
          style={styles.textInput}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 20 }}>
        <TouchableOpacity
          //onPress={() => router.back()}
          style={[styles.button, { backgroundColor: "red" }]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (editMode ? handleUpdate() : handleSave())}
          style={[styles.button, { backgroundColor: "blue" }]}
        >
          <Text style={styles.buttonText}>{editMode ? "Update" : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleResetDatabase}
        style={[styles.button, { backgroundColor: "gray", marginTop: 20 }]}
      >
        <Text style={styles.buttonText}>Reset Database</Text>
      </TouchableOpacity>

      <View style={styles.userList}>
        <UserList refreshSignal={refreshSignal} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userList: {
    margin: 20,
    width: "100%",
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    width: 300,
    borderRadius: 5,
    borderColor: "slategray",
  },
  button: {
    height: 40,
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
  },
});
