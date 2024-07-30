import { NavLink } from "react-router-dom";
import { Logout } from "../logout";

export const MobileMenu = ({ setMenuOpen, isLoggedIn }) => {
  return (
    <ul className="absolute top-16 right-4 bg-gray-800 p-4 rounded shadow-md space-y-2 z-10">
      {!isLoggedIn ? (
        <>
          <li className="nav-item">
            <NavLink className="nav-link text-white p-2" to="/signup" onClick={() => setMenuOpen(false)}>
              Registration
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white p-2" to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </NavLink>
          </li>
        </>
      ) : (
        <>
          <li className="nav-item">
            <NavLink className="nav-link text-white p-2" to="/" onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white p-2" to="/profile" onClick={() => setMenuOpen(false)}>
              Profile
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white p-2" to="/create-post" onClick={() => setMenuOpen(false)}>
              Create Post
            </NavLink>
          </li>
          <li className="nav-item">
            <Logout />
          </li>
        </>
      )}
    </ul>
  );
};
