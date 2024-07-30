// src/components/Login.js
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../store/authcontext";
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import { loginValidationSchema } from "../../validation";
import "../../../public/css/form/style.css";

export const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await axios.post("http://localhost:8000/api/login", {
          email: values.email,
          password: values.password,
        });
        
        const token = res.data.token;
        localStorage.setItem("token", token);
        dispatch({ type: "LOGIN" });

        navigate("/");
      } catch (error) {
        setError("Invalid email or password. Please try again.");
      }
      resetForm();
    },
  });

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-screen">
      <form className="form needs-validation" onSubmit={formik.handleSubmit} noValidate>
        <Typography variant="h5">Login Account</Typography>
        <FormControl fullWidth margin="normal">
          <TextField
            id="loginFloatingEmail"
            name="email"
            type="email"
            variant="outlined"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            required
            label="Email"
            helperText={formik.touched.email && formik.errors.email}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            id="loginFloatingPassword"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            required
            label="Password"
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handlePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
        {error && (
          <Typography variant="body1" color="error" className="mt-2">
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
        <Typography variant="body1" className="mt-3">
          Don&#39;t have an account? <Link to="/signup">Create Account</Link>
        </Typography>
      </form>
    </div>
  );
};
