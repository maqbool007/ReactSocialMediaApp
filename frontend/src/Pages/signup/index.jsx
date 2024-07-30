import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  FormControl,
  Input,
  IconButton,
  InputAdornment,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import { signupValidationSchema } from "../../validation";
import "../../../public/css/form/style.css";

export const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signupFileField = useRef(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      profilePicture: null,
    },
    validationSchema: signupValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true); // Show spinner

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      if (values.profilePicture) {
        formData.append("profilePicture", values.profilePicture);
      }

      try {
        await axios.post("http://localhost:8000/api/signup", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Signup Successful");
        navigate("/verify-email", { state: { email: values.email } });
      } catch (error) {
        console.error("Error", error.response ? error.response.data : error.message);
        setError("Failed to create account. Please try again.");
      }

      setLoading(false); // Hide spinner

      resetForm();
      signupFileField.current.value = "";
    },
  });

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignupFile = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("profilePicture", file);
  };

  return (
    <div className="h-screen">
      <Backdrop open={loading} style={{ zIndex: 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <form className="form" onSubmit={formik.handleSubmit}>
        <h2>Create Account</h2>
        <FormControl fullWidth margin="normal">
          <TextField
            id="signupName"
            name="name"
            type="text"
            label="Name"
            placeholder="Enter your name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            id="signupEmail"
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            id="signupPassword"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handlePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <Input
            id="signupProfilePicture"
            name="profilePicture"
            type="file"
            inputRef={signupFileField}
            onChange={handleSignupFile}
            style={{ display: "none" }} // Hide the file input
          />
          <label htmlFor="signupProfilePicture">
            <Button variant="outlined" component="span" fullWidth>
              {formik.values.profilePicture ? formik.values.profilePicture.name : "Choose File"}
            </Button>
          </label>
        </FormControl>
        {error && (
          <Typography variant="body1" color="error" className="mt-2">
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
        <Typography variant="body1" className="mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </form>
    </div>
  );
};
