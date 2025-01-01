import { supabase } from './supabase'

class NotificationService {
  constructor() {
    this.tableName = 'notifications'
  }

  // Get notifications for a user
  async getNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting notifications:', error)
      throw error
    }
  }

  // Create a new notification
  async createNotification({ type, recipientId, senderId, contentId, commentId, message }) {
    try {
      const notification = {
        type,
        recipient_id: recipientId,
        sender_id: senderId,
        content_id: contentId,
        comment_id: commentId,
        message,
        created_at: new Date().toISOString(),
        read: false
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([notification])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ read: true })
        .eq('recipient_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Subscribe to new notifications
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }
}

export const notificationService = new NotificationService()
