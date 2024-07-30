import { useState, useEffect } from "react";
import { IconButton, TextField, InputAdornment } from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Comment,
  Send,
} from "@mui/icons-material";
import axios from "axios";
import io from "socket.io-client";
import "./CardFooter.css"; // Import the CSS file
import {jwtDecode} from "jwt-decode";

const socket = io.connect("http://localhost:8000");

const CardFooter = ({ post, userId, userName, token }) => {
  let userImage;

  if (token) {
    const decodedToken = jwtDecode(token);
    userImage = decodedToken.file;
  }

  const [isLiked, setIsLiked] = useState(post.likes.includes(userId));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentCount, setCommentCount] = useState(
    post.comments.length +
      post.comments.reduce((acc, comment) => acc + comment.replies.length, 0)
  );
  const [showComments, setShowComments] = useState(false);
  const [repliesVisibility, setRepliesVisibility] = useState({});

  useEffect(() => {
    const handleReceivedComment = (data) => {
      const { postId, newComment } = data;
      if (postId === post._id) {
        setComments((prev) => [...prev, { ...newComment, showReplies: false }]);
        setCommentCount((prev) => prev + 1);
      }
    };

    const handleReceivedLike = (data) => {
      const { postId, likeUserId, isLiked } = data;
      if (postId === post._id) {
        setLikesCount((prevCount) => (isLiked ? prevCount + 1 : prevCount - 1));
        if (likeUserId === userId) {
          setIsLiked(isLiked);
        }
      }
    };

    const handleReceivedReply = (data) => {
      const { commentId, newReply } = data;
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
              showReplies: true,
            };
          }
          return comment;
        })
      );
      setCommentCount((prev) => prev + 1);
    };

    socket.on("received-comment", handleReceivedComment);
    socket.on("received-like", handleReceivedLike);
    socket.on("received-reply", handleReceivedReply);

    return () => {
      socket.off("received-comment", handleReceivedComment);
      socket.off("received-like", handleReceivedLike);
      socket.off("received-reply", handleReceivedReply);
    };
  }, [post._id, userId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (showComments) {
        try {
          const res = await axios.get(
            `http://localhost:8000/api/post/${post._id}/comment`,
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          setComments(
            res.data.data.map((comment) => ({ ...comment, showReplies: false }))
          );
          const newCommentCount =
            res.data.data.length +
            res.data.data.reduce(
              (acc, comment) => acc + comment.replies.length,
              0
            );
          setCommentCount(newCommentCount);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      }
    };

    fetchComments();
  }, [post._id, token, showComments]);

  const handleLike = async () => {
    try {
      const url = isLiked
        ? `http://localhost:8000/api/post/${post._id}/unlike`
        : `http://localhost:8000/api/post/${post._id}/like`;

      await axios.post(
        url,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount((prevCount) =>
        newIsLiked ? prevCount + 1 : prevCount - 1
      );

      socket.emit("like", {
        postId: post._id,
        likeUserId: userId,
        isLiked: newIsLiked,
      });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  const handlePostComment = async () => {
    if (!commentInput) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/post/${post._id}/comment`,
        { content: commentInput },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      const newComment = res.data.data;
      newComment.userId = { name: userName, file: userImage };
      setCommentInput("");
      socket.emit("comment", {
        postId: post._id,
        newComment,
        commentId: newComment._id,
      });

      const updatedComments = await axios.get(
        `http://localhost:8000/api/post/${post._id}/comment`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setComments(
        updatedComments.data.data.map((comment) => ({
          ...comment,
          showReplies: false,
        }))
      );
      const newCommentCount =
        updatedComments.data.data.length +
        updatedComments.data.data.reduce(
          (acc, comment) => acc + comment.replies.length,
          0
        );
      setCommentCount(newCommentCount);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handlePostReply = async (commentId, replyInput) => {
    if (!replyInput) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/post/${post._id}/comment/${commentId}/reply`,
        { content: replyInput },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      const newReply = res.data.data;
      newReply.userId = { name: userName, file: userImage };

      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
              showReplies: true,
              replyInput: "",
            };
          }
          return comment;
        })
      );
      setCommentCount((prev) => prev + 1);

      socket.emit("reply", { commentId, newReply });

      const updatedComments = await axios.get(
        `http://localhost:8000/api/post/${post._id}/comment`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setComments(
        updatedComments.data.data.map((comment) => ({
          ...comment,
          showReplies: true,
        }))
      );
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleShare = async () => {
    try {
      // Placeholder logic for sharing
      console.log("Share functionality to be implemented.");
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const toggleReplies = (commentId) => {
    setRepliesVisibility((prevVisibility) => ({
      ...prevVisibility,
      [commentId]: !prevVisibility[commentId],
    }));
  };

  const formatCommentTime = (createdAt) => {
    const currentDate = new Date();
    const commentDate = new Date(createdAt);
    const diffTime = Math.abs(currentDate - commentDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="card-footer flex flex-col">
      <div className="actions flex justify-between items-center mb-3">
        <div className="flex items-center">
          <IconButton
            onClick={handleLike}
            color={isLiked ? "primary" : "default"}
          >
            {isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
          </IconButton>
          <span>{likesCount} Likes</span>
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => setShowComments(!showComments)}>
            <Comment />
          </IconButton>
          <span
            onClick={() => setShowComments(!showComments)}
            className="cursor-pointer"
          >
            {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
          </span>
        </div>
        <div className="flex items-center">
          <IconButton onClick={handleShare}>
            <Share />
          </IconButton>
          <span onClick={handleShare} className="cursor-pointer">
            {" "}
            Share
          </span>
        </div>
      </div>
      {showComments && (
        <div className="comments">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="comment bg-white rounded p-3 mb-3 shadow"
              >
                <div className="comment-header flex justify-between">
                  <div className="flex items-center">
                    <img
                      src={comment.userId.file} // Ensure this is the correct field
                      alt={comment.userId.name}
                      className="comment-user-image rounded-full w-14 h-14 mr-2"
                    />
                    <strong>{comment.userId.name}</strong>
                    <span className="comment-time ml-2 text-sm">
                      {formatCommentTime(comment.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="comment-content mt-2">{comment.content}</div>
                <div className="replies mt-2">
                  {comment.replies && comment.replies.length > 0 && (
                    <button
                      className="text-blue-500 cursor-pointer"
                      onClick={() => toggleReplies(comment._id)}
                    >
                      {repliesVisibility[comment._id]
                        ? "Hide Replies"
                        : `View ${comment.replies.length} Replies`}
                    </button>
                  )}
                  {repliesVisibility[comment._id] &&
                    comment.replies &&
                    comment.replies.length > 0 && (
                      <div className="replies-list mt-2">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="reply bg-gray-100 rounded p-2 mt-2"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <img
                                  src={reply.userId.file} // Ensure this is the correct field
                                  alt={reply.userId.name}
                                  className="reply-user-image rounded-full w-14 h-14 mr-2"
                                />
                                <strong>{reply.userId.name}</strong>
                                <span className="text-sm ml-2">
                                  {formatCommentTime(reply.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="reply-content mt-1">
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="reply-input mt-2 flex">
                    <TextField
                      label="Reply to comment"
                      size="small"
                      variant="outlined"
                      fullWidth
                      value={comment.replyInput || ""}
                      onChange={(e) => {
                        const updatedComments = comments.map((c) =>
                          c._id === comment._id
                            ? { ...c, replyInput: e.target.value }
                            : c
                        );
                        setComments(updatedComments);
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                handlePostReply(comment._id, comment.replyInput)
                              }
                              color={comment.replyInput ? "primary" : "default"}
                            >
                              <Send style={{ color: "#0891b2" }} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-comments">No comments yet.</div>
          )}
          <div className="comment-input flex mt-3">
            <TextField
              label="Write a comment"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handlePostComment}
                      color={commentInput ? "primary" : "default"}
                    >
                      <Send style={{ color: "#0891b2" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CardFooter;
