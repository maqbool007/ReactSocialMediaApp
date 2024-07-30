import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";

const EditPostDialog = ({ post, open, onClose, onSave }) => {
  const [content, setContent] = useState(post.content);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(
    post.file && post.file !== "default-file.jpg" ? post.file : ""
  );

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setFileName(post.file && post.file !== "default-file.jpg" ? post.file : "");
    }
  }, [post]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    console.log("Selected file:", selectedFile.name);
  };

  const handleEditSave = async () => {
    const token = localStorage.getItem("token");
    try {
      let fileUrl = post.file;
      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);
        const uploadRes = await axios.patch(
          `http://localhost:8000/api/post/${post._id}`, // Ensure this endpoint exists and handles file upload
          formData,
          {
            headers: {
              "x-auth-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Upload response:-----", uploadRes.data);
        fileUrl = uploadRes.data.data.file; 
        console.log("image-------->",fileUrl)
      }
      await axios.patch(
        `http://localhost:8000/api/post/${post._id}`,
        { content },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      onSave(post._id, { content, file: fileUrl });
      onClose();
    } catch (error) {
      console.error("Failed to update post", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Post</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Content"
          type="text"
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <>
          <label htmlFor="file-input">
            <Button variant="contained" component="span">
              Attach Image
            </Button>
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
              id="file-input"
            />
          </label>
          {fileName && <p className="overflow-hidden ">{fileName}</p>}
        </>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleEditSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
