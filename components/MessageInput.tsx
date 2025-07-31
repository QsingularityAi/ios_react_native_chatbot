import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { View as ThemedView } from './Themed';
import { useTheme } from '@/components/ThemeProvider';

const ATouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type Props = {
  onShouldSend: (message: string) => void;
};

const MessageInput = ({ onShouldSend }: Props) => {
  const [message, setMessage] = useState('');
  const { bottom } = useSafeAreaInsets();
  const expanded = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);
  const { actualColorScheme } = useTheme();

  const expandItems = () => {
    expanded.value = withTiming(1, { duration: 400 });
  };

  const collapseItems = () => {
    expanded.value = withTiming(0, { duration: 400 });
  };

  const expandButtonStyle = useAnimatedStyle(() => {
    const opacityInterpolation = interpolate(expanded.value, [0, 1], [1, 0], Extrapolation.CLAMP);
    const widthInterpolation = interpolate(expanded.value, [0, 1], [30, 0], Extrapolation.CLAMP);

    return {
      opacity: opacityInterpolation,
      width: widthInterpolation,
    };
  });

  const buttonViewStyle = useAnimatedStyle(() => {
    const widthInterpolation = interpolate(expanded.value, [0, 1], [0, 100], Extrapolation.CLAMP);
    return {
      width: widthInterpolation,
      opacity: expanded.value,
    };
  });

  const onChangeText = (text: string) => {
    collapseItems();
    setMessage(text);
  };

  const onSend = () => {
    onShouldSend(message);
    setMessage('');
  };

  return (
    <BlurView 
      intensity={80} 
      tint={actualColorScheme === 'dark' ? 'dark' : 'light'} 
      style={{ 
        paddingBottom: bottom, 
        paddingTop: 10,
        backgroundColor: 'transparent' 
      }}
    >
      <ThemedView style={[styles.row, { backgroundColor: 'transparent' }]}>
        <ATouchableOpacity onPress={expandItems} style={[styles.roundBtn, expandButtonStyle, { backgroundColor: actualColorScheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
          <Ionicons name="add" size={24} color={actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault} />
        </ATouchableOpacity>

        <Animated.View style={[styles.buttonView, buttonViewStyle]}>
          <TouchableOpacity onPress={() => ImagePicker.launchCameraAsync()}>
            <Ionicons name="camera-outline" size={24} color={actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => ImagePicker.launchImageLibraryAsync()}>
            <Ionicons name="image-outline" size={24} color={actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => DocumentPicker.getDocumentAsync()}>
            <Ionicons name="folder-outline" size={24} color={actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault} />
          </TouchableOpacity>
        </Animated.View>

        <TextInput
          autoFocus
          ref={inputRef}
          placeholder="Message"
          placeholderTextColor={actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault}
          style={[styles.messageInput, { 
            borderColor: actualColorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
            backgroundColor: actualColorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface,
            color: actualColorScheme === 'dark' ? Colors.dark.text : Colors.light.text
          }]}
          onFocus={collapseItems}
          onChangeText={onChangeText}
          value={message}
          multiline
        />
        <TouchableOpacity onPress={onSend} disabled={message?.length === 0}>
          <Ionicons name="arrow-up-circle" size={24} color={actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault} />
        </TouchableOpacity>
      </ThemedView>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageInput: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    padding: 10,
  },
  roundBtn: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
export default MessageInput;
