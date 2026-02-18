import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const RASA_URL = "https://super-chainsaw-r45vv4g5jrpg354pv-5005.app.github.dev";

export default function ChatDrawer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await fetch(`${RASA_URL}/webhooks/rest/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "user", // Can be dynamic, e.g., currentUserId from Supabase
          message: inputText,
        }),
      });

      if (!response.ok) {
        throw new Error("Rasa response error");
      }

      const data: { text?: string }[] = await response.json();
      data.forEach((msg) => {
        if (msg.text) {
          const botMessage: Message = {
            id: Date.now().toString(),
            text: msg.text,
            isUser: false,
          };
          setMessages((prev) => [...prev, botMessage]);
        }
        // TODO: Handle other response types like images if needed (e.g., <Image source={{uri: msg.image}} />)
      });
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Error connecting to Rasa. Please try again.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with Rasa</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.isUser ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F9", // Fondo Indigo muy claro para que las burbujas resalten
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E1B4B",
    textAlign: "center",
    paddingVertical: 15,
    backgroundColor: "#FFF",
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    letterSpacing: -0.5,
  },
  // Contenedor de las burbujas
  messageContainer: {
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    maxWidth: "85%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  // Mensaje del Usuario (Violeta vibrante)
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: 4, // Esquina chat clásica
  },
  // Mensaje del Bot / Sistema (Indigo suave)
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#1E1B4B",
  },
  // Input Area "Floating Style"
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: "#1E1B4B",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    color: "#1E1B4B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sendButton: {
    backgroundColor: "#4F46E5",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
