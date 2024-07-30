import { Route, Routes, Navigate } from "react-router-dom";
import { Login, SignUp, Logout, Home, Profile,  CreatePost,VerifyEmail } from "../Pages";

const isAuthenticated = () => {
  return !!localStorage.getItem("token"); 
};
const PrivateRoute = ({ element: Component }) => {
  return isAuthenticated() ? Component : <Navigate to="/login" />;
};

const PublicRoute = ({ element: Component }) => {
  return !isAuthenticated() ? Component : <Navigate to="/" />;
};

export const Routers = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<PublicRoute element={<Login />} />} />
    <Route path="/signup" element={<PublicRoute element={<SignUp />} />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
    <Route path="/create-post" element={<PrivateRoute element={<CreatePost />} />} />
    <Route path="/logout" element={<Logout />} />
  </Routes>
);
