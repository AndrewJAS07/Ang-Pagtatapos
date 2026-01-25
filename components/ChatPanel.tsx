import React, { useEffect, useState, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Platform, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSocket } from '../lib/socket-context'
import { messagingAPI, API_URL } from '../lib/api'

type ChatPanelProps = {
  rideId: string
  conversationId?: string
  userRole: 'driver' | 'commuter'
}

export default function ChatPanel({ rideId, conversationId, userRole }: ChatPanelProps) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  // Request notification permissions
  useEffect(() => {
    (async () => {
      try {
        await Notifications.requestPermissionsAsync()
      } catch (err) {
        console.error('Notification permission error:', err)
      }
    })()
  }, [])

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await messagingAPI.getMessageHistory(rideId)
      const arr = Array.isArray(response?.messages) ? response.messages : []
      setMessages(arr)
    } catch (err: any) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages. Tap to retry.')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [rideId])

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [rideId, loadMessages])

  // Socket.IO real-time messaging
  useEffect(() => {
    const room = conversationId || rideId
    if (!socket || !room) return

    socket.emit('joinConversationRoom', room)

    const handleMessageReceived = async (payload: any) => {
      if (payload.conversationId === room || payload.rideId === rideId) {
        setMessages((prev) => {
          // Prevent duplicates
          const exists = prev.some((m) => m._id === payload.message?._id)
          if (exists) return prev
          return [...prev, payload.message]
        })

        // Show notification
        try {
          const token = await AsyncStorage.getItem('token')
          if (token) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'New Message',
                body: payload.message?.message || 'You received a new message',
              },
              trigger: null,
            })
          }
        } catch (err) {
          console.error('Notification error:', err)
        }
      }
    }

    const handleTypingUpdate = (data: any) => {
      setTyping(!!data.isTyping)
    }

    socket.on('messageReceived', handleMessageReceived)
    socket.on('userTyping', handleTypingUpdate)

    return () => {
      socket.emit('leaveConversationRoom', room)
      socket.off('messageReceived', handleMessageReceived)
      socket.off('userTyping', handleTypingUpdate)
    }
  }, [socket, conversationId, rideId])

  // Fallback polling when socket unavailable
  useEffect(() => {
    const startPolling = async () => {
      const poll = async () => {
        try {
          const response = await messagingAPI.getMessageHistory(rideId)
          const arr = Array.isArray(response?.messages) ? response.messages : []

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id))
            const newMessages = arr.filter((m: any) => !existingIds.has(m._id))
            if (newMessages.length === 0) return prev
            return [...prev, ...newMessages]
          })
        } catch (err) {
          console.error('Polling error:', err)
        }
      }

      if (!isConnected && !socket) {
        await poll()
        pollInterval.current = setInterval(poll, 3000)
      }
    }

    startPolling()

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [isConnected, socket, rideId])

  // Send message with validation and error handling
  const sendMessage = useCallback(async () => {
    const text = input.trim()

    if (!text) {
      Alert.alert('Empty Message', 'Please type a message before sending.')
      return
    }

    if (text.length > 5000) {
      Alert.alert('Message Too Long', 'Message cannot exceed 5000 characters.')
      return
    }

    try {
      setSending(true)
      const response = await messagingAPI.sendMessage({
        rideId,
        message: text,
        messageType: 'text',
      })

      if (response.success && response.message) {
        setMessages((prev) => [...prev, response.message])
        setInput('')
        setError(null)
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch (err: any) {
      console.error('Send error:', err)
      setError(err.message || 'Failed to send message')
      Alert.alert('Send Error', 'Could not send message. Check your connection.')
    } finally {
      setSending(false)
    }
  }, [input, rideId])

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    const room = conversationId || rideId
    if (!socket || !room) return

    socket.emit('typingStart', { conversationId: room, userId: userRole })

    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit('typingStop', { conversationId: room, userId: userRole })
    }, 1000)
  }, [socket, conversationId, rideId, userRole])

  // Format timestamp
  const formatTime = (date: string | Date) => {
    try {
      const d = new Date(date)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const quickReplies = ['On my way', 'Running late', 'Here', 'Thanks']

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ride Chat</Text>
        {isConnected ? (
          <View style={styles.connectionStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Connected</Text>
          </View>
        ) : (
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, styles.disconnected]} />
            <Text style={[styles.statusText, styles.disconnectedText]}>Offline</Text>
          </View>
        )}
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadMessages}>
            <Ionicons name="refresh" size={18} color="#dc3545" />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d4217" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && messages.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation</Text>
        </View>
      )}

      {/* Messages List */}
      {!loading && messages.length > 0 && (
        <FlatList
          data={messages}
          keyExtractor={(item: any) => item._id || Math.random().toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageWrapper,
                item.messageType === 'system' && styles.systemMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.message,
                  item.messageType === 'system' && styles.systemMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          scrollEnabled={true}
        />
      )}

      {/* Typing Indicator */}
      {typing && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Typing</Text>
          <View style={styles.typingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      )}

      {/* Quick Replies */}
      <View style={styles.quickRepliesRow}>
        {quickReplies.map((q) => (
          <TouchableOpacity
            key={q}
            style={styles.quickReplyButton}
            onPress={() => {
              setInput(q)
            }}
            disabled={sending}
          >
            <Text style={styles.quickReplyText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Area */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={(t) => {
            setInput(t)
            handleTyping()
          }}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          style={styles.input}
          accessibilityLabel="Message input"
          editable={!sending && !loading}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (sending || !input.trim()) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={sending || !input.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d4217',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
  },
  disconnectedText: {
    color: '#ef4444',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#dc3545',
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  list: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  systemMessageWrapper: {
    justifyContent: 'center',
  },
  message: {
    maxWidth: '85%',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  systemMessage: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    maxWidth: '95%',
  },
  messageText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  typingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingText: {
    color: '#6b7280',
    fontSize: 13,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  },
  quickRepliesRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  quickReplyButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickReplyText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    color: '#111827',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#0d4217',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
})

