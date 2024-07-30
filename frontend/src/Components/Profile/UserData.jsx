import { useState, useEffect } from 'react';
import Button from "@mui/material/Button";

const UserData = ({ user, onEdit }) => {
  const [profilePicture, setProfilePicture] = useState("https://via.placeholder.com/120");

  useEffect(() => {
    if (user.file) {
      if (typeof user.file === 'string') {
        setProfilePicture(user.file);
      } else {
        const objectURL = URL.createObjectURL(user.file);
        setProfilePicture(objectURL);
        return () => URL.revokeObjectURL(objectURL);
      }
    }
  }, [user.file]);

  return (
    <div className="profile-header">
      <img src={profilePicture} alt="User profile" />
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <Button variant="contained" onClick={onEdit}>Edit Profile</Button>
      </div>
    </div>
  );
};

export default UserData;
