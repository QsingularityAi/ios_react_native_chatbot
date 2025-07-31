import Colors from '@/constants/Colors';
import { getChats, renameChat } from '@/utils/Database';
import { Chat } from '@/utils/Interfaces';
import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerToggleButton,
} from '@react-navigation/drawer';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ContextMenu from 'zeego/context-menu';
import { useColorScheme } from '../../../components/useColorScheme';
import { ThemeToggle } from '../../../components/ThemeToggle';

export const CustomDrawerContent = (
  props: DrawerContentComponentProps & { loadChats: () => void; history: Chat[] },
) => {
  const { bottom, top } = useSafeAreaInsets();
  const db = useSQLiteContext();
  const router = useRouter();
  const { history, loadChats } = props;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    useCallback(() => {
      loadChats();
      // Absolutely necessary to ignore this error
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onDeleteChat = (chatId: number) => {
    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          // Delete the chat
          await db.runAsync('DELETE FROM chats WHERE id = ?', chatId);
          loadChats();
        },
      },
    ]);
  };

  const onRenameChat = (chatId: number) => {
    Alert.prompt('Rename Chat', 'Enter a new name for the chat', async (newName) => {
      if (newName) {
        // Rename the chat
        await renameChat(db, chatId, newName);
        loadChats();
      }
    });
  };

  return (
    <View style={{ flex: 1, marginTop: top }}>
      <View style={{ backgroundColor: colors.background, paddingBottom: 10 }}>
        <View style={[styles.searchSection, { backgroundColor: colors.surface }]}>
          <Ionicons style={styles.searchIcon} name="search" size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.input, { color: colors.text }]} 
            placeholder="Search" 
            placeholderTextColor={colors.textSecondary}
            underlineColorAndroid="transparent" 
          />
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: colors.background, paddingTop: 0 }}>
        {/* <DrawerItemList {...props} /> */}
        {history.map((chat) => (
          <ContextMenu.Root key={chat.id}>
            <ContextMenu.Trigger>
              <DrawerItem
                label={chat.title}
                onPress={() => router.push(`/(auth)/(drawer)/(chat)/${chat.id}`)}
                inactiveTintColor={colors.text}
                activeTintColor={colors.text}
              />
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Preview>
                {() => (
                  <View style={{ padding: 16, height: 200, backgroundColor: colors.background }}>
                    <Text style={{ color: colors.text }}>{chat.title}</Text>
                  </View>
                )}
              </ContextMenu.Preview>

              <ContextMenu.Item key={'rename'} onSelect={() => onRenameChat(chat.id)}>
                <ContextMenu.ItemTitle>Rename</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: 'pencil',
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
              <ContextMenu.Item key={'delete'} onSelect={() => onDeleteChat(chat.id)} destructive>
                <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: 'trash',
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        ))}
      </DrawerContentScrollView>

      <View
        style={{
          padding: 16,
          paddingBottom: 10 + bottom,
          backgroundColor: colors.background,
        }}
      >
        <Link href="/(auth)/(modal)/settings" asChild>
          <TouchableOpacity style={styles.footer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <Ionicons name="person" size={24} color={colors.text} />
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>Profile</Text>
            <ThemeToggle />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const Layout = () => {
  const dimensions = useWindowDimensions();
  const db = useSQLiteContext();
  const [history, setHistory] = useState<Chat[]>([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadChats = async () => {
    // Load chats from SQLite
    const result = (await getChats(db)) as Chat[];
    setHistory(result);
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} loadChats={loadChats} history={history} />}
      screenOptions={{
        headerLeft: () => {
          Keyboard.dismiss();
          return <DrawerToggleButton tintColor={colors.textSecondary} />;
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        drawerActiveBackgroundColor: colors.surface,
        drawerActiveTintColor: colors.text,
        drawerInactiveTintColor: colors.text,
        overlayColor: 'rgba(0, 0, 0, 0.2)',
        drawerItemStyle: { borderRadius: 12 },
        drawerLabelStyle: { marginLeft: -20 },
        drawerStyle: { width: dimensions.width * 0.86, backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen
        name="(chat)/new"
        getId={() => Math.random().toString()}
        options={{
          title: 'ChatGPT',
          headerRight: () => (
            <Link href={'/(auth)/(drawer)/(chat)/new'} push asChild>
              <TouchableOpacity>
                <Ionicons name="create-outline" size={24} color={colors.textSecondary} style={{ marginRight: 16 }} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="(chat)/[id]"
        options={{
          drawerItemStyle: {
            display: 'none',
          },
          headerRight: () => (
            <Link href={'/(auth)/(drawer)/(chat)/new'} push asChild>
              <TouchableOpacity>
                <Ionicons name="create-outline" size={24} color={colors.textSecondary} style={{ marginRight: 16 }} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    marginHorizontal: 16,
    borderRadius: 10,
    height: 34,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 0,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roundImage: {
    width: 30,
    height: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
});

export default Layout;
