import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase, isConfigured } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import TodosScreen from './src/screens/TodosScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isConfigured) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.h}>Supabase not configured</Text>
        <Text style={styles.p}>
          Copy .env.example to .env, add your Supabase URL and anon key, then restart with
          `npx expo start -c`.
        </Text>
      </View>
    );
  }

  if (!ready) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <>
      <StatusBar style="dark" />
      {session ? <TodosScreen key={session.user.id} session={session} /> : <AuthScreen />}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  h: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  p: { textAlign: 'center', color: '#555' },
});
