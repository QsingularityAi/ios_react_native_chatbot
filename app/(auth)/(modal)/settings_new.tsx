import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { keyStorage } from '@/utils/Storage';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import React from 'react';
import { Text, View, ScrollView } from '@/components/Themed';
import { useTheme } from '@/components/ThemeProvider';

const Page = () => {
  const [cerebrasKey, setCerebrasKey] = useMMKVString('cerebras_apikey', keyStorage);
  const [groqKey, setGroqKey] = useMMKVString('groq_apikey', keyStorage);
  const [openrouterKey, setOpenrouterKey] = useMMKVString('openrouter_apikey', keyStorage);
  const [cerebrasApiKey, setCerebrasApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const router = useRouter();
  const { actualColorScheme } = useTheme();

  const { signOut } = useAuth();

  const saveApiKey = async () => {
    if (cerebrasApiKey.trim()) {
      setCerebrasKey(cerebrasApiKey.trim());
    }
    if (groqApiKey.trim()) {
      setGroqKey(groqApiKey.trim());
    }
    if (openrouterApiKey.trim()) {
      setOpenrouterKey(openrouterApiKey.trim());
    }
    router.navigate('/(auth)/(drawer)');
  };

  const removeApiKeys = async () => {
    setCerebrasKey('');
    setGroqKey('');
    setOpenrouterKey('');
  };

  const hasAnyKey = (cerebrasKey && cerebrasKey !== '') || (groqKey && groqKey !== '') || (openrouterKey && openrouterKey !== '');

  return (
    <ScrollView style={styles.container}>
      {hasAnyKey && (
        <View style={styles.section}>
          <Text style={styles.label}>API Keys Configured!</Text>
          <View style={styles.keyStatus}>
            <Text style={styles.statusText}>
              Cerebras API: {cerebrasKey && cerebrasKey !== '' ? '✅ Configured' : '❌ Not set'}
            </Text>
            <Text style={styles.statusText}>
              Groq API: {groqKey && groqKey !== '' ? '✅ Configured' : '❌ Not set'}
            </Text>
            <Text style={styles.statusText}>
              OpenRouter API: {openrouterKey && openrouterKey !== '' ? '✅ Configured' : '❌ Not set'}
            </Text>
          </View>
          <TouchableOpacity
            style={[defaultStyles.btn, { backgroundColor: Colors.primary }]}
            onPress={removeApiKeys}>
            <Text style={styles.buttonText}>Remove All API Keys</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Cerebras API Key:</Text>
        <Text style={styles.description}>
          Required for Llama and Qwen models hosted on Cerebras
        </Text>
        <TextInput
          style={styles.input}
          value={cerebrasApiKey}
          onChangeText={setCerebrasApiKey}
          placeholder="Enter your Cerebras API key"
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Groq API Key:</Text>
        <Text style={styles.description}>
          Required for Llama, Kimi, and DeepSeek R1 models hosted on Groq
        </Text>
        <TextInput
          style={styles.input}
          value={groqApiKey}
          onChangeText={setGroqApiKey}
          placeholder="Enter your Groq API key"
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>OpenRouter API Key:</Text>
        <Text style={styles.description}>
          Required for GLM, Qwen VL, DeepCoder, Hunyuan, and Kimi models on OpenRouter
        </Text>
        <TextInput
          style={styles.input}
          value={openrouterApiKey}
          onChangeText={setOpenrouterApiKey}
          placeholder="Enter your OpenRouter API key"
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[defaultStyles.btn, { backgroundColor: Colors.primary }]}
        onPress={saveApiKey}>
        <Text style={styles.buttonText}>Save API Keys</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <TouchableOpacity
          style={[defaultStyles.btn, { backgroundColor: actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}
          onPress={() => signOut()}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 10,
  },
  keyStatus: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Page;
