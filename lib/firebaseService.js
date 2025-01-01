import { database } from './firebase';
import {
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  onValue,
  update,
  remove,
} from 'firebase/database';

// Utility function to handle timeouts
const withTimeout = (promise, timeoutMs = 10000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Comments Service
export const commentsService = {
  // Get comments for a specific content
  async getComments(contentId) {
    if (!contentId) {
      console.error('ContentId is required for getting comments');
      return [];
    }

    try {
      console.log(`Fetching comments for contentId: ${contentId}`);
      const commentsRef = ref(database, `comments/${contentId}`);
      const commentsQuery = query(commentsRef, orderByChild('timestamp'));
      
      const snapshot = await withTimeout(get(commentsQuery));
      console.log(`Successfully retrieved snapshot for contentId: ${contentId}`);

      const comments = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          try {
            const commentData = childSnapshot.val();
            if (commentData) {
              const comment = {
                id: childSnapshot.key,
                ...commentData,
                userImage: commentData.userImage || '/default-avatar.png', // Fallback avatar
              };
              comments.push(comment);
            }
          } catch (err) {
            console.error('Error processing comment:', {
              contentId,
              commentId: childSnapshot.key,
              error: err.message,
            });
          }
        });
      }

      const sortedComments = comments.sort((a, b) => b.timestamp - a.timestamp);
      console.log(`Processed ${sortedComments.length} comments for contentId: ${contentId}`);
      return sortedComments;
    } catch (error) {
      console.error('Error fetching comments:', {
        contentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Add a new comment
  async addComment(contentId, comment) {
    try {
      console.log(`Adding new comment for contentId: ${contentId}`);
      const commentsRef = ref(database, `comments/${contentId}`);
      const newCommentRef = push(commentsRef);
      await withTimeout(set(newCommentRef, {
        ...comment,
        timestamp: Date.now(),
        likes: {},
        replies: {},
      }));
      console.log(`Successfully added comment for contentId: ${contentId}`);
      return { ...comment, id: newCommentRef.key };
    } catch (error) {
      console.error('Error adding comment:', {
        contentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Add a reply to a comment
  async addReply(contentId, commentId, reply) {
    try {
      console.log(`Adding new reply for contentId: ${contentId} and commentId: ${commentId}`);
      const replyRef = ref(database, `comments/${contentId}/${commentId}/replies`);
      const newReplyRef = push(replyRef);
      await withTimeout(set(newReplyRef, {
        ...reply,
        timestamp: Date.now(),
        likes: {},
      }));
      console.log(`Successfully added reply for contentId: ${contentId} and commentId: ${commentId}`);
      return { ...reply, id: newReplyRef.key };
    } catch (error) {
      console.error('Error adding reply:', {
        contentId,
        commentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Toggle like on comment or reply
  async toggleLike(contentId, commentId, userId, isReply = false, parentCommentId = null) {
    try {
      console.log(`Toggling like for contentId: ${contentId} and commentId: ${commentId}`);
      const path = isReply
        ? `comments/${contentId}/${parentCommentId}/replies/${commentId}/likes/${userId}`
        : `comments/${contentId}/${commentId}/likes/${userId}`;
      const likeRef = ref(database, path);
      const snapshot = await withTimeout(get(likeRef));
      
      if (snapshot.exists()) {
        await withTimeout(remove(likeRef));
        console.log(`Successfully removed like for contentId: ${contentId} and commentId: ${commentId}`);
        return false;
      } else {
        await withTimeout(set(likeRef, true));
        console.log(`Successfully added like for contentId: ${contentId} and commentId: ${commentId}`);
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', {
        contentId,
        commentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Subscribe to comments for a specific content
  subscribeToComments(contentId, callback) {
    if (!contentId) {
      console.error('ContentId is required for subscribing to comments');
      callback([]);
      return () => {};
    }

    try {
      console.log(`Subscribing to comments for contentId: ${contentId}`);
      const commentsRef = ref(database, `comments/${contentId}`);
      const commentsQuery = query(commentsRef, orderByChild('timestamp'));
      
      const unsubscribe = onValue(commentsQuery, (snapshot) => {
        try {
          const comments = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              try {
                const commentData = childSnapshot.val();
                if (commentData) {
                  const comment = {
                    id: childSnapshot.key,
                    ...commentData,
                    userImage: commentData.userImage || '/default-avatar.png', // Fallback avatar
                  };
                  comments.push(comment);
                }
              } catch (err) {
                console.error('Error processing comment:', {
                  contentId,
                  commentId: childSnapshot.key,
                  error: err.message,
                });
              }
            });
          }
          callback(comments.sort((a, b) => b.timestamp - a.timestamp));
        } catch (err) {
          console.error('Error processing comments snapshot:', {
            contentId,
            error: err.message,
            stack: err.stack,
          });
          callback([]);
        }
      }, (error) => {
        console.error('Error subscribing to comments:', {
          contentId,
          error: error.message,
          stack: error.stack,
        });
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up comment subscription:', {
        contentId,
        error: error.message,
        stack: error.stack,
      });
      callback([]);
      return () => {};
    }
  },
};

// Notifications Service
export const notificationsService = {
  // Add a new notification
  async addNotification(userId, notification) {
    try {
      console.log(`Adding new notification for userId: ${userId}`);
      const notificationsRef = ref(database, `notifications/${userId}`);
      const newNotificationRef = push(notificationsRef);
      await withTimeout(set(newNotificationRef, {
        ...notification,
        timestamp: Date.now(),
        read: false,
      }));
      console.log(`Successfully added notification for userId: ${userId}`);
      return { ...notification, id: newNotificationRef.key };
    } catch (error) {
      console.error('Error adding notification:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Mark notifications as read
  async markAsRead(userId, notificationIds) {
    try {
      console.log(`Marking notifications as read for userId: ${userId}`);
      const updates = {};
      notificationIds.forEach((id) => {
        updates[`notifications/${userId}/${id}/read`] = true;
      });
      await withTimeout(update(ref(database), updates));
      console.log(`Successfully marked notifications as read for userId: ${userId}`);
    } catch (error) {
      console.error('Error marking notifications as read:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Clear all notifications
  async clearNotifications(userId) {
    try {
      console.log(`Clearing notifications for userId: ${userId}`);
      const notificationsRef = ref(database, `notifications/${userId}`);
      await withTimeout(remove(notificationsRef));
      console.log(`Successfully cleared notifications for userId: ${userId}`);
    } catch (error) {
      console.error('Error clearing notifications:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Listen to notifications for a user
  subscribeToNotifications(userId, callback) {
    try {
      console.log(`Subscribing to notifications for userId: ${userId}`);
      const notificationsRef = ref(database, `notifications/${userId}`);
      const notificationsQuery = query(notificationsRef, orderByChild('timestamp'));
      
      const unsubscribe = onValue(notificationsQuery, (snapshot) => {
        const notifications = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const notification = {
              id: childSnapshot.key,
              ...childSnapshot.val(),
            };
            notifications.unshift(notification);
          });
        }
        callback(notifications);
      }, (error) => {
        console.error('Error subscribing to notifications:', {
          userId,
          error: error.message,
          stack: error.stack,
        });
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notification subscription:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      callback([]);
      return () => {};
    }
  },

  // Add movie notification for all users
  async addNewMovieNotification(movieData) {
    try {
      console.log(`Adding new movie notification for all users`);
      const usersRef = ref(database, 'users');
      const snapshot = await withTimeout(get(usersRef));
      
      if (snapshot.exists()) {
        const updates = {};
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const notificationRef = push(ref(database, `notifications/${userId}`));
          updates[`notifications/${userId}/${notificationRef.key}`] = {
            type: 'new_movie',
            message: `New movie added: ${movieData.title}`,
            movieId: movieData.id,
            timestamp: Date.now(),
            read: false,
          };
        });
        await withTimeout(update(ref(database), updates));
        console.log(`Successfully added new movie notification for all users`);
      }
    } catch (error) {
      console.error('Error adding new movie notification:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },
};
