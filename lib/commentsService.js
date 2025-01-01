import { supabase } from './supabase'

class CommentsService {
  constructor() {
    this.tableName = 'comments'
  }

  // Get comments for a specific content
  async getComments(contentId) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required')
      }

      // Get all comments with their replies
      const { data: comments, error } = await supabase
        .from(this.tableName)
        .select(`
          id,
          content,
          contentid,
          userid,
          username,
          userimage,
          created_at,
          likes,
          parentid,
          replies:${this.tableName}!parentid(
            id,
            content,
            contentid,
            userid,
            username,
            userimage,
            created_at,
            likes,
            parentid
          )
        `)
        .eq('contentid', contentId)
        .is('parentid', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error)
        throw new Error(error.message)
      }

      // Process the comments to ensure replies are properly ordered
      const processedComments = comments?.map(comment => ({
        ...comment,
        replies: (comment.replies || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
      })) || [];
      
      return processedComments;
    } catch (error) {
      console.error('Error in getComments:', error)
      throw error
    }
  }

  // Add a new comment
  async addComment(contentId, { content, userId, userName, userImage, parentId = null }) {
    try {
      if (!contentId || !content || !userId || !userName) {
        throw new Error('Missing required fields')
      }

      const newComment = {
        content: content.trim(),
        contentid: contentId,
        userid: userId,
        username: userName,
        userimage: userImage || null,
        created_at: new Date().toISOString(),
        parentid: parentId,
        likes: []
      }
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([newComment])
        .select(`
          id,
          content,
          contentid,
          userid,
          username,
          userimage,
          created_at,
          likes,
          parentid
        `)
        .single()

      if (error) {
        console.error('Error adding comment:', error)
        throw new Error(error.message)
      }

      // Return the complete comment data
      return {
        ...data,
        username: userName,
        userimage: userImage || null,
        userid: userId,
        likes: [],
        replies: []
      }
    } catch (error) {
      console.error('Error in addComment:', error)
      throw error
    }
  }

  // Delete comment
  async deleteComment(commentId, userId) {
    try {
      if (!commentId || !userId) {
        throw new Error('Comment ID and User ID are required')
      }

      // Check if user owns the comment
      const { data: comment, error: fetchError } = await supabase
        .from(this.tableName)
        .select('userid')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError
      if (!comment) throw new Error('Comment not found')
      if (comment.userid !== userId) throw new Error('Not authorized to delete this comment')

      // Delete comment (cascade will handle replies)
      const { error: deleteError } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', commentId)

      if (deleteError) throw deleteError

      return true
    } catch (error) {
      console.error('Error in deleteComment:', error)
      throw error
    }
  }

  // Delete comment and its replies
  async deleteCommentAndReplies(commentId, userId) {
    try {
      if (!commentId || !userId) {
        throw new Error('Comment ID and User ID are required')
      }

      // Check if user owns the comment
      const { data: comment, error: fetchError } = await supabase
        .from(this.tableName)
        .select('userid')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError
      if (!comment) throw new Error('Comment not found')
      if (comment.userid !== userId) throw new Error('Not authorized to delete this comment')

      // Delete comment and its replies
      const { error: deleteError } = await supabase
        .from(this.tableName)
        .delete()
        .or(`id.eq.${commentId},parentid.eq.${commentId}`)

      if (deleteError) throw deleteError

      return true
    } catch (error) {
      console.error('Error deleting comment and replies:', error)
      throw error
    }
  }

  // Toggle like
  async toggleLike(commentId, userId) {
    try {
      if (!commentId || !userId) {
        throw new Error('Comment ID and User ID are required')
      }

      // Get current comment likes
      const { data: comment, error: fetchError } = await supabase
        .from(this.tableName)
        .select('likes')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError
      if (!comment) throw new Error('Comment not found')

      // Toggle like
      const likes = comment.likes || []
      const userLikeIndex = likes.indexOf(userId)
      const newLikes = userLikeIndex === -1
        ? [...likes, userId]
        : likes.filter(id => id !== userId)

      // Update comment likes
      const { error: updateError } = await supabase
        .from(this.tableName)
        .update({ likes: newLikes })
        .eq('id', commentId)

      if (updateError) throw updateError

      return true
    } catch (error) {
      console.error('Error in toggleLike:', error)
      throw error
    }
  }

  // Subscribe to real-time updates
  subscribeToComments(contentId, callback) {
    return supabase
      .channel('comments_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `contentid=eq.${contentId}`
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }
}

export const commentsService = new CommentsService()
