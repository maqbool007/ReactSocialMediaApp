import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const PostHeader = ({
  post,
  anchorEl,
  setAnchorEl, // Add setAnchorEl to update state in parent component
  handleEditOpen,
  handleDeleteOpen,
}) => {
  const [uploading, setUploading] = useState(false); // State to manage upload loading

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Open menu when clicking MoreHorizIcon
  };

  const handleClose = () => {
    setAnchorEl(null); // Close menu
  };

  const handleProfilePictureUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Start uploading spinner

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      const uploadRes = await axios.patch(
        `http://localhost:8000/api/user/${post.userId._id}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-auth-token": token,
          },
        }
      );

      const updatedImageUrl = uploadRes.data.data.file;
      // Assuming post.userId is updated with new image URL
      post.userId.file = updatedImageUrl;
    } catch (error) {
      console.error("Failed to update profile picture", error);
    } finally {
      setUploading(false); // Stop uploading spinner
    }
  };

  return (
    <div className="card-header">
      <div className="card-img-nam flex items-center">
        {uploading ? (
          <CircularProgress size={24} color="inherit" /> 
        ) : (
          <img
            src={post.userId?.file || "https://via.placeholder.com/50"}
            alt="User profile"
            className="h-14 w-14"
          />
        )}
        <span>{post.userId?.name || "Anonymous"}</span>
      </div>
      <div className="dots">
        <input
          type="file"
          id="profilePictureInput"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleProfilePictureUpdate}
        />
        <label htmlFor="profilePictureInput">
          <IconButton component="span" onClick={handleClick}>
            <MoreHorizIcon />
          </IconButton>
        </label>
      </div>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleEditOpen}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteOpen}>Delete</MenuItem>
      </Menu>
    </div>
  );
};

export default PostHeader;
