import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Backdrop,
  CircularProgress,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import "tailwindcss/tailwind.css";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("OTP is required");
      return;
    }

    setLoading(true); // Show spinner

    try {
      await axios.post("http://localhost:8000/api/verify-email", {
        email,
        otp,
      });

      console.log("Email verification successful");
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error(
        "Error",
        error.response ? error.response.data : error.message
      );
      setError("Failed to verify email. Please try again.");
    }

    setLoading(false); // Hide spinner
  };

  const handleResendOtp = async () => {
    setLoading(true); // Show spinner
    setCanResend(false);
    setTimer(120); // Reset timer

    try {
      await axios.post("http://localhost:8000/api/resend-otp", {
        email,
      });

      console.log("OTP resent successfully");
    } catch (error) {
      console.error(
        "Error",
        error.response ? error.response.data : error.message
      );
      setError("Failed to resend OTP. Please try again.");
    }

    setLoading(false); // Hide spinner
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Backdrop open={loading} className="z-50">
        <CircularProgress color="inherit" />
      </Backdrop>
      <form className="bg-white p-6 rounded shadow-md w-full max-w-md" onSubmit={handleVerifySubmit}>
        <h2 className="text-2xl font-semibold mb-4">Verify Email</h2>
        <FormControl fullWidth margin="normal">
          <TextField
            id="verifyEmail"
            name="email"
            type="email"
            label="Email"
            value={email}
            disabled
            fullWidth
            className="mb-4"
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            id="verifyOtp"
            name="otp"
            type="text"
            label="OTP Code"
            placeholder="Enter OTP code"
            value={otp}
            onChange={handleOtpChange}
            required
            className="mb-4"
          />
        </FormControl>
        {error && (
          <Typography variant="body1" color="error" className="text-red-500 mt-2">
            {error}
          </Typography>
        )}
        <div className="mt-4">
          {canResend ? (
            <Button variant="outlined" color="primary" onClick={handleResendOtp} fullWidth>
              Resend OTP
            </Button>
          ) : (
            <Typography variant="body1" align="center" className="text-gray-500">
              Resend OTP in {Math.floor(timer / 60)}:{("0" + (timer % 60)).slice(-2)}
            </Typography>
          )}
        </div>
        <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
          Verify Email
        </Button>
      </form>
      <Dialog open={successDialogOpen} onClose={handleSuccessDialogClose}>
        <DialogTitle className="flex items-center">
          <CheckCircleIcon className="text-green-500 mr-2" />
          Email Verified
        </DialogTitle>
        <DialogContent>
          <Typography>Email verification successful! You can now log in.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
