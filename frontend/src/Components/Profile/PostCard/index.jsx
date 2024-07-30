import {  useState } from "react";
import axios from "axios";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import EditPostDialog from "./EditPostDialog";
import DeletePostDialog from "./DeletePostDialog";
import CardFooter from "../../CardFooter";
import {jwtDecode} from "jwt-decode";
import { Backdrop, CircularProgress } from "@mui/material";

const PostCard = ({ post, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const token = localStorage.getItem("token");
  let userId, userName ;

  if (token) {
    const decodedToken = jwtDecode(token);
    console.log("token",decodedToken)
    userId = decodedToken.userId;
    userName = decodedToken.name;
  }
 

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditOpen = () => {
    setEditOpen(true);
    handleClose();
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
    handleClose();
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const handleEditSave = async (postId, updatedPost) => {
    setLoading(true); // Start loading
    try {
      const token = localStorage.getItem("token");
      let fileUrl = updatedPost.file;
      if (updatedPost.file && updatedPost.file !== "default-file.jpg") {
        const formData = new FormData();
        formData.append("profilePicture", updatedPost.file);
        const uploadRes = await axios.patch(
          `http://localhost:8000/api/post/${postId}`,
          formData,
          {
            headers: {
              "x-auth-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fileUrl = uploadRes.data.data.file;
        console.log(fileUrl);
      }
      await axios.patch(
        `http://localhost:8000/api/post/${postId}`,
        { content: updatedPost.content, file: fileUrl },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      onEdit(postId, { content: updatedPost.content, file: fileUrl });
      handleEditClose();
    } catch (error) {
      console.error("Failed to update post", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true); // Start loading
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/post/${post._id}`, {
        headers: {
          "x-auth-token": token,
        },
      });
      onDelete(post._id);
      handleDeleteClose();
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div key={post._id} className="card">
      <PostHeader
        post={post}
        anchorEl={anchorEl}
        handleClick={handleClick}
        handleClose={handleClose}
        handleEditOpen={handleEditOpen}
        handleDeleteOpen={handleDeleteOpen}
      />
      <PostContent post={post} />
      <EditPostDialog
        post={post}
        open={editOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
      <DeletePostDialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
      />
      <CardFooter post={post} userId={userId} userName={userName} token={token}  />
      <Backdrop open={loading} style={{ zIndex: 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default PostCard;
