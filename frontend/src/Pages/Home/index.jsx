import  { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import CardFooter from "../../Components/CardFooter";

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");
  let userId, userName;

  if (token) {
    const decodedToken = jwtDecode(token);
    userId = decodedToken.userId;
    userName = decodedToken.name;
  }

  useEffect(() => {
    fetchAllPosts();
  }, [userId]);

  const fetchAllPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/post");
      setPosts(res.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <div className="flex justify-center h-full">
      <div className="w-full max-w-screen-lg">
        {posts.map((post) => (
          <div key={post._id} className="card mb-5 w-50 mx-auto">
            <div className="card-header justify-start">
              <img
                src={post.userId.file || "https://via.placeholder.com/40"}
                alt="User profile"
                className="w-14 h-14 rounded-full mr-3"
              />
              <span>{post.userId.name}</span>
            </div>
            <div className="card-body py-3">
              <p className="card-text">{post.content}</p>
            </div>
            {post.file && post.file !== "default-file.jpg" && (
              <img className="card-img w-full p-3 mx-auto" src={post.file} alt="Card file cap" />
            )}
            <CardFooter post={post} userId={userId} userName={userName} token={token} />
          </div>
        ))}
      </div>
    </div>
  );
};
