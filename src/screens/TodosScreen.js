import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert,
  ActivityIndicator, SafeAreaView, Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function TodosScreen({ session }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | done

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) Alert.alert('Error loading todos', error.message);
    else setTodos(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addTodo() {
    const text = title.trim();
    if (!text) return;
    setTitle('');
    const { data, error } = await supabase.from('todos').insert({ title: text }).select().single();
    if (error) return Alert.alert('Error', error.message);
    setTodos((t) => [data, ...t]);
  }

  async function toggle(todo) {
    setTodos((t) => t.map((x) => (x.id === todo.id ? { ...x, is_complete: !x.is_complete } : x)));
    const { error } = await supabase
      .from('todos').update({ is_complete: !todo.is_complete }).eq('id', todo.id);
    if (error) { Alert.alert('Error', error.message); load(); }
  }

  async function remove(todo) {
    setTodos((t) => t.filter((x) => x.id !== todo.id));
    const { error } = await supabase.from('todos').delete().eq('id', todo.id);
    if (error) { Alert.alert('Error', error.message); load(); }
  }

  const visible = todos.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.is_complete : !t.is_complete
  );
  const remaining = todos.filter((t) => !t.is_complete).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Todos</Text>
          <Text style={styles.sub}>{remaining} remaining · {session.user.email}</Text>
        </View>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.signout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="What needs doing?"
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['all', 'active', 'done'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipOn]}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ListEmptyComponent={<Text style={styles.empty}>Nothing here yet 🎉</Text>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <TouchableOpacity style={styles.itemMain} onPress={() => toggle(item)}>
                <Text style={styles.check}>{item.is_complete ? '☑️' : '⬜'}</Text>
                <Text style={[styles.itemText, item.is_complete && styles.done]}>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item)}>
                <Text style={styles.del}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1, backgroundColor: '#f6f7fb',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  sub: { color: '#667', marginTop: 2 },
  signout: { color: '#4f46e5', fontWeight: '600' },
  addRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e1e4ee', fontSize: 16,
  },
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  addText: { color: '#fff', fontWeight: '700' },
  filters: { flexDirection: 'row', gap: 8, padding: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e9eaf3' },
  chipOn: { backgroundColor: '#4f46e5' },
  chipText: { color: '#445', textTransform: 'capitalize' },
  chipTextOn: { color: '#fff' },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#eceef6',
  },
  itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { fontSize: 20 },
  itemText: { fontSize: 16, flex: 1 },
  done: { textDecorationLine: 'line-through', color: '#99a' },
  del: { color: '#d33', fontSize: 18, paddingHorizontal: 6 },
  empty: { textAlign: 'center', color: '#889', marginTop: 40 },
});
