import { getAuth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      console.error('Unauthorized access attempt');
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { method } = req;
    const contentId = req.query.contentId;

    if (!contentId) {
      console.error('Missing contentId in request');
      return res.status(400).json({ error: "Content ID is required" });
    }

    console.log(`Processing ${method} request for contentId: ${contentId}`);

    switch (method) {
      case 'GET':
        // Check if we're fetching notifications
        if (req.query.notifications === 'true') {
          const { data: notifications, error: notifError } = await supabase
            .from('comments')
            .select('*')
            .eq('isread', false)
            .not('userid', 'eq', userId)
            .order('created_at', { ascending: false });

          if (notifError) throw notifError;
          return res.status(200).json(notifications);
        }

        // Regular comments fetch
        const { data: comments, error: getError } = await supabase
          .from('comments')
          .select(`
            *,
            replies:comments!parentid(*)
          `)
          .eq('contentid', contentId)
          .is('parentid', null)
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(comments);

      case 'POST':
        const { content, userName, userImage, parentId } = req.body;
        const newComment = {
          contentid: contentId,
          content,
          userid: userId,
          username: userName,
          userimage: userImage,
          parentid: parentId || null,
          created_at: new Date().toISOString(),
          likes: []
        };

        const { data: commentData, error: postError } = await supabase
          .from('comments')
          .insert([newComment])
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(commentData);

      case 'PUT':
        // Handle marking notifications as read
        if (req.query.markRead === 'true') {
          const { commentId } = req.body;
          const { error: markReadError } = await supabase
            .from('comments')
            .update({ isread: true })
            .eq('id', commentId);

          if (markReadError) throw markReadError;
          return res.status(200).json({ message: 'Notification marked as read' });
        }

        const { commentId, action, content: newContent } = req.body;
        
        if (action === 'edit') {
          const { data: updatedComment, error: updateError } = await supabase
            .from('comments')
            .update({ content: newContent })
            .eq('id', commentId)
            .single();

          if (updateError) throw updateError;
          return res.status(200).json(updatedComment);
        } else if (action === 'like') {
          const { data: comment, error: getCommentError } = await supabase
            .from('comments')
            .select('likes')
            .eq('id', commentId)
            .single();

          if (getCommentError) throw getCommentError;

          const likes = comment.likes || [];
          const newLikes = likes.includes(userId)
            ? likes.filter(id => id !== userId)
            : [...likes, userId];

          const { data: likedComment, error: likeError } = await supabase
            .from('comments')
            .update({ likes: newLikes })
            .eq('id', commentId)
            .single();

          if (likeError) throw likeError;
          return res.status(200).json(likedComment);
        } else if (action === 'reply') {
          if (!newContent) {
            return res.status(400).json({ error: "Content is required for reply" });
          }
          const { data: newReply, error: replyError } = await supabase
            .from('comments')
            .insert([
              {
                contentid: contentId,
                content: newContent,
                userid: userId,
                username: req.body.userName,
                userimage: req.body.userImage || '/default-avatar.png',
                parentid: commentId,
                isread: false,
                created_at: new Date().toISOString()
              }
            ])
            .single();

          if (replyError) throw replyError;
          return res.status(201).json(newReply);
        }
        break;

      case 'DELETE':
        const { id } = req.body;
        const { error: deleteError } = await supabase
          .from('comments')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return res.status(200).json({ message: 'Comment deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
