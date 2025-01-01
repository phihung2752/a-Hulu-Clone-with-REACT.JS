import { getAuth } from "@clerk/nextjs/server";
import { commentsService } from '../../../../lib/commentsService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { commentId } = req.query;
    const contentId = req.query.contentId;

    if (!commentId || !contentId) {
      return res.status(400).json({ error: "Comment ID and Content ID are required" });
    }

    const result = await commentsService.toggleLike(commentId, userId);
    return res.status(200).json({ liked: result });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
}
