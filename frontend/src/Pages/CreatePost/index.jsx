import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import { Photo } from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const CreatePost = () => {
  const [open, setOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [text, setText] = useState("");
  const [photoText, setPhotoText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [userImage, setUserImage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserImage(decodedToken.file);
    }
  }, [token]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handlePhotoDialogOpen = () => {
    setPhotoDialogOpen(true);
  };

  const handlePhotoDialogClose = () => {
    setPhotoDialogOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/post",
        { content: text },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      console.log("Data saved:", response.data);
      setText(""); // Clear text after submission
    } catch (error) {
      console.error("Error saving data:", error);
    }
    handleClose();
  };

  const handlePhotoSubmit = async () => {
    const formData = new FormData();
    formData.append("content", photoText);
    formData.append("profilePicture", imageFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/post",
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Photo saved:", response.data);
      setPhotoText("");
      setImageFile(null);
    } catch (error) {
      console.error("Error saving photo:", error);
    }
    handlePhotoDialogClose();
  };

  return (
    <div className="h-screen">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "500px",
          margin: "0 auto",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <Box display="flex" alignItems="center" marginBottom="16px">
          <Avatar
            src={userImage}
            alt="User Image"
            style={{ width: "70px", height: "69px" }}
          />
          <Box flexGrow={1} marginLeft="10px">
            <TextField
              label="What's on your mind?"
              variant="outlined"
              onClick={handleClickOpen}
              fullWidth
              multiline
              rows={1}
              value=""
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: false }}
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-around">
          <IconButton color="primary" onClick={handlePhotoDialogOpen}>
            <Photo />
            <span>Post Photo</span>
          </IconButton>
        </Box>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle className="text-center font-black">
            Create Post
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Text"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} color="primary">
              Post
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={photoDialogOpen}
          onClose={handlePhotoDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="text-center font-black">
            Add photos
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Add a description"
              type="text"
              fullWidth
              multiline
              rows={2}
              value={photoText}
              onChange={(e) => setPhotoText(e.target.value)}
            />
            <Button
              variant="contained"
              component="label"
              style={{ marginTop: "16px" }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePhotoDialogClose} color="primary">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePhotoSubmit}
              color="primary"
            >
              Post
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
