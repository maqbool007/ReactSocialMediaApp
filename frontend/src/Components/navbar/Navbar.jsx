import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../store/authcontext";
import { Logout } from "../logout";
import MenuIcon from '@mui/icons-material/Menu';
import { MobileMenu } from "./Mobile";
import { Backdrop, CircularProgress } from "@mui/material";
import "./navbar.css";

export const Navbar = () => {
  const { state } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const fetchData = async () => {
      // Simulate a delay
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Backdrop open={loading} style={{ zIndex: 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <div className="relative flex justify-between items-center p-4 bg-gray-800 mb-1">
      <div className="text-white text-xl">
        Social Media
      </div>
      <ul className="hidden sm:flex space-x-4">
        {!state.isLoggedIn ? (
          <>
            <li className="nav-item">
              <NavLink className="nav-link text-white p-2" to="/signup">
                Registration
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-white p-2" to="/login">
                Login
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <NavLink className="nav-link text-white p-2" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-white p-2" to="/profile">
                Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-white p-2" to="/create-post">
                Create Post
              </NavLink>
            </li>
            <li className="nav-item">
              <Logout />
            </li>
          </>
        )}
      </ul>
      <div className="sm:hidden">
        <button className="text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <MenuIcon style={{ fontSize: 24 }} />
        </button>
        {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} isLoggedIn={state.isLoggedIn} />}
      </div>
    </div>
  );
};
