import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

const Comments = ({ movieId }) => {
    const { user, isSignedIn } = useUser();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        const savedComments = localStorage.getItem(`movie-${movieId}-comments`);
        if (savedComments) {
            setComments(JSON.parse(savedComments));
        }
    }, [movieId]);

    const saveComments = (newComments) => {
        localStorage.setItem(`movie-${movieId}-comments`, JSON.stringify(newComments));
        setComments(newComments);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isSignedIn) return;

        const comment = {
            id: Date.now(),
            text: newComment,
            timestamp: new Date().toISOString(),
            edited: false,
            userId: user.id,
            userName: user.fullName || 'Anonymous',
            userImage: user.imageUrl,
        };

        saveComments([comment, ...comments]);
        setNewComment('');
    };

    const handleEdit = (id) => {
        const comment = comments.find(c => c.id === id);
        setEditingId(id);
        setEditText(comment.text);
    };

    const handleSaveEdit = (id) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === id) {
                return {
                    ...comment,
                    text: editText,
                    edited: true,
                    lastEdited: new Date().toISOString()
                };
            }
            return comment;
        });

        saveComments(updatedComments);
        setEditingId(null);
        setEditText('');
    };

    const handleDelete = (id) => {
        const updatedComments = comments.filter(comment => comment.id !== id);
        saveComments(updatedComments);
    };

    return (
        <div className="bg-[#0D2834] rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
            
            {/* Comment Form */}
            {isSignedIn ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <Image
                                src={user.imageUrl}
                                alt={user.fullName}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </div>
                        <div className="flex-grow">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                            <button
                                type="submit"
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Comment
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="text-center py-4 text-gray-400">
                    Please sign in to leave a comment
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <Image
                                src={comment.userImage}
                                alt={comment.userName}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </div>
                        <div className="flex-grow">
                            {editingId === comment.id ? (
                                <div>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full p-2 bg-gray-800 text-gray-200 rounded-lg resize-none focus:outline-none"
                                        rows="3"
                                    />
                                    <div className="mt-2 space-x-2">
                                        <button
                                            onClick={() => handleSaveEdit(comment.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white font-medium">{comment.userName}</span>
                                            <span className="ml-2 text-sm text-gray-400">
                                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                            </span>
                                            {comment.edited && (
                                                <span className="text-gray-400 text-sm ml-2">
                                                    (edited {formatDistanceToNow(new Date(comment.lastEdited), { addSuffix: true })})
                                                </span>
                                            )}
                                        </div>
                                        {user?.id === comment.userId && (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => handleEdit(comment.id)}
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-gray-300">{comment.text}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;
