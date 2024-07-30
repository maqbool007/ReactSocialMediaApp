import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../Components/Profile/Profile.css";
import UserData from "../../Components/Profile/UserData";
import PostCard from "../../Components/Profile/PostCard";
import { EditProfile } from "../../Components/Profile/EditProfile";
import { Backdrop, CircularProgress } from "@mui/material";

export const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false); // New state for edit loading
  const [postLoading, setPostLoading] = useState(false); // New state for post actions loading
  const token = localStorage.getItem("token");

  const fetchAllPosts = useCallback(async () => {
    if (!token) {
      setError("User is not authenticated");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("http://localhost:8000/api/post/user", {
        headers: {
          "x-auth-token": token,
        },
      });
      const id = res.data.id;
      const data = res.data.data;
      setPosts(data);
      return id;
    } catch (err) {
      setError("Failed to fetch posts");
      console.error(err);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = useCallback(
    async (id) => {
      if (!token) {
        setError("User is not authenticated");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8000/api/user/${id}`, {
          headers: {
            "x-auth-token": token,
          },
        });
        const data = res.data;
        setUser(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user");
        console.error(err);
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    const fetchData = async () => {
      const id = await fetchAllPosts();
      if (id) {
        await fetchUser(id);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAllPosts, fetchUser]);

  const handleEditPost = async (postId, updatedPost) => {
    setPostLoading(true);
    try {
      await axios.patch(`http://localhost:8000/api/post/${postId}`, updatedPost, {
        headers: {
          "x-auth-token": token,
        },
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, ...updatedPost } : post
        )
      );
    } catch (error) {
      console.error("Failed to update post", error);
      setError("Failed to update post");
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setPostLoading(true);
    try {
      await axios.delete(`http://localhost:8000/api/post/${postId}`, {
        headers: {
          "x-auth-token": token,
        },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Failed to delete post", error);
      setError("Failed to delete post");
    } finally {
      setPostLoading(false);
    }
  };

  const handleEditProfileOpen = () => {
    setEditProfileOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };

  const handleEditProfileSave = async (updatedUser) => {
    setEditLoading(true);
    try {
      await axios.patch(
        `http://localhost:8000/api/user/${user._id}`,
        updatedUser,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      // Fetch the updated user data
      await fetchUser(user._id);
      setEditProfileOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      setError("Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <Backdrop open={loading} style={{ zIndex: 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="profile-page h-full">
      {user && (
        <>
          <UserData user={user} onEdit={handleEditProfileOpen} />
        </>
      )}
      <div className="posts ">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        ))}
      </div>
      {user && (
        <EditProfile
          user={user}
          open={editProfileOpen}
          onClose={handleEditProfileClose}
          onSave={handleEditProfileSave}
        />
      )}
      <Backdrop open={editLoading || postLoading} style={{ zIndex: 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};
