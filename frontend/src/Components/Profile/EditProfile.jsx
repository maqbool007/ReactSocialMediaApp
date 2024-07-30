import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { Backdrop, CircularProgress } from "@mui/material";

export const EditProfile = ({ user, open, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(user.file ? user.file : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setFileName(user.file ? user.file : "");
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleEditSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      let fileUrl = user.file;
      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);
        const uploadRes = await axios.patch(
          `http://localhost:8000/api/user/${user._id}`,
          formData,
          {
            headers: {
              "x-auth-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fileUrl = uploadRes.data.data.file;
      }
      const updateData = { name, email, file: fileUrl };
      if (password) {
        updateData.password = password;
      }
      await axios.patch(
        `http://localhost:8000/api/user/${user._id}`,
        updateData,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      onSave(updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="text-center">Edit Profile</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <Backdrop open={loading} style={{ zIndex: 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
};
