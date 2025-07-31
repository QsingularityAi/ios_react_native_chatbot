import Colors from '@/constants/Colors';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text, ScrollView, View as ThemedView } from './Themed';
import { useTheme } from '@/components/ThemeProvider';

const PredefinedMessages = [
  { title: 'Explain React Native', text: "like I'm five years old" },
  { title: 'Suggest fun activites', text: 'for a family visting San Francisco' },
  { title: 'Recommend a dish', text: "to impress a date who's a picky eater" },
];

type Props = {
  onSelectCard: (message: string) => void;
};

const MessageIdeas = ({ onSelectCard }: Props) => {
  const { actualColorScheme } = useTheme();
  
  return (
    <ThemedView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 16,
        }}>
        {PredefinedMessages.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: actualColorScheme === 'dark' ? Colors.dark.border : Colors.light.border }]}
            onPress={() => onSelectCard(`${item.title} ${item.text}`)}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
            <Text style={{ color: actualColorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault, fontSize: 14 }}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 10,
  },
});
export default MessageIdeas;
