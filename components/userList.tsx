// components/UserList.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

type Props = {
  refreshSignal: number; // changes to this trigger refresh
};

export default function UserList({ refreshSignal }: Props) {
  const database = useSQLiteContext();
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const results = await database.getAllAsync<{
          id: number;
          name: string;
          email: string;
        }>(`SELECT * FROM users`);
        setUsers(results);
      } catch (e) {
        console.error("Failed to load users:", e);
      }
    };

    loadUsers();
  }, [refreshSignal]); // reload when signal changes

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User List</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userText}>{item.name} ({item.email})</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  userCard: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  userText: { fontSize: 18 },
});
