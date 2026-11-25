import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function submit() {
    if (!email || !password) return Alert.alert('Enter email and password');
    setLoading(true);
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return Alert.alert('Error', error.message);
    if (isSignUp && !data.session) {
      Alert.alert('Check your email', 'Confirm your address, then sign in.');
      setIsSignUp(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>✅ Todo</Text>
      <Text style={styles.subtitle}>{isSignUp ? 'Create an account' : 'Welcome back'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.buttonText}>{isSignUp ? 'Sign up' : 'Sign in'}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.link}>
          {isSignUp ? 'Have an account? Sign in' : "No account? Sign up"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f6f7fb' },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#667', marginBottom: 24, fontSize: 16 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e1e4ee', fontSize: 16,
  },
  button: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#4f46e5', marginTop: 18, fontSize: 15 },
});
