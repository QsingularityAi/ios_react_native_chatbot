import Colors from '@/constants/Colors';
import { Message, Role } from '@/utils/Interfaces';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from "@expo/vector-icons";
import { Text, View as ThemedView } from './Themed';
import { useTheme } from '@/components/ThemeProvider';

const ChatMessage = ({
  content,
  role,
  loading,
  reasoning_content,
}: Message & { loading?: boolean }) => {
  const { actualColorScheme } = useTheme();
  
  const getMarkdownStyles = () => ({
    body: {
      color: actualColorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
      fontSize: 16,
    },
    code_inline: {
      backgroundColor: actualColorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
      borderRadius: 4,
      padding: 2,
      fontFamily: 'Menlo',
      color: actualColorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
    },
    code_block: {
      backgroundColor: actualColorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
      borderRadius: 8,
      padding: 10,
      fontFamily: 'Menlo',
      color: actualColorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
    },
    link: {
      color: actualColorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint,
    },
  });

  return (
    <ThemedView style={styles.row}>
      <ThemedView style={{marginTop: 10}}>
      {role === Role.Bot ? (
        <ThemedView style={[styles.item, { backgroundColor: actualColorScheme === 'dark' ? Colors.dark.text : Colors.light.background }]}>
          <Image source={require('@/assets/images/logo-white.png')} style={styles.btnImage} />
        </ThemedView>
      ) : (
        <ThemedView style={[styles.avatar, { backgroundColor: actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="person" size={20} color={actualColorScheme === 'dark' ? Colors.dark.background : Colors.light.background} />
        </ThemedView>
      )}
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loading}>
          <ActivityIndicator color={actualColorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} size="small" />
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.messageContainer}>
            {reasoning_content ? (
              <ThemedView style={[styles.reasoningContainer, { borderLeftColor: actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}>
                <Text style={[styles.reasoningText, { color: actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}>{reasoning_content}</Text>
              </ThemedView>
            ) : null}
            <ThemedView style={styles.markdownContainer}>
              <Markdown style={getMarkdownStyles()} mergeStyle>
                {content}
              </Markdown>
            </ThemedView>
          </ThemedView>
        </>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    gap: 14,
    marginVertical: 12,
  },
  item: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  btnImage: {
    margin: 6,
    width: 16,
    height: 16,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageContainer: {
    flex: 1,
    gap: 8,
  },
  markdownContainer: {
    flex: 1,
    padding: 4,
  },
  text: {
    padding: 4,
    fontSize: 16,
    flexWrap: 'wrap',
    flex: 1,
  },
  reasoningContainer: {
    borderLeftWidth: 2,
    paddingLeft: 8,
  },
  reasoningText: {
    fontSize: 14,
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
  loading: {
    justifyContent: 'center',
    height: 26,
    marginLeft: 14,
  },
});

export default ChatMessage;
