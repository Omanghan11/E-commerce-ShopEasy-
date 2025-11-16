import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../pages/useAuth.jsx"; // Ensure this path is correct

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Access the login function from the auth context

  // Input state
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  // Forgot password state
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Feedback state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error"); // "error" or "success"

  // Auto-hide toast
  React.useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 5000); // 5 seconds for blocked user message
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Toggle login/signup
  const toggleForm = () => {
    setFullName("");
    setEmailOrPhone("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setAdminCode("");
    setError("");
    setSuccess("");
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!forgotEmailOrPhone || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch("${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: forgotEmailOrPhone,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setForgotEmailOrPhone("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => {
          setShowForgotPassword(false);
          setSuccess("");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Basic validation
    if (!emailOrPhone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    const isValidEmail = emailRegex.test(emailOrPhone);
    const isValidPhone = phoneRegex.test(emailOrPhone.replace(/\s/g, ""));

    if (!isValidEmail && !isValidPhone) {
      setError("Please enter a valid email address or phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      let response;

      if (isLogin) {
        // ✅ LOGIN
        const loginEndpoint = isAdminLogin ? 
          "${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/auth/admin-login" : 
          "${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/auth/login";
          
        response = await fetch(loginEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone, password }),
          credentials: "include",
        });
      } else {
        // ✅ REGISTER
        if (!fullName) {
          setError("Please enter your full name.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        response = await fetch("${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email: isValidEmail ? emailOrPhone : "",
            phone: isValidPhone ? emailOrPhone : phone, // handle phone properly
            password,
            adminCode: adminCode || undefined, // Send admin code if provided
          }),
          credentials: "include",
        });
      }

      const data = await response.json();

      if (!response.ok) {
        // Check if user is blocked
        if (data.blocked) {
          const blockMessage = `🚫 Account Blocked: ${data.blockReason ? data.blockReason : 'Please contact support for assistance.'}`;
          setToastMessage(blockMessage);
          setToastType("error");
          setError("Your account has been blocked. Please contact support.");
          
          // Store blocked user info for support page
          localStorage.setItem('blockedUser', JSON.stringify({
            email: emailOrPhone,
            blockReason: data.blockReason,
            blockedAt: data.blockedAt
          }));
          
          // Redirect to support page after 3 seconds
          setTimeout(() => {
            navigate('/support-blocked');
          }, 3000);
        } else {
          setError(data.message || "Something went wrong.");
        }
        return;
      }
      
      // ✅ Use the login function from the context
      login(data.token, data.user); 
      
      // Also store in localStorage for consistency
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      setSuccess(isLogin ? "Login successful! Redirecting..." : "Account created successfully!");

      // Determine redirect path
      let redirectPath = "/";
      
      if (isLogin && data.user?.role === 'admin') {
        redirectPath = "/admin";
      } else if (!isLogin && data.user?.role === 'admin') {
        // If admin signed up, also redirect to admin
        redirectPath = "/admin";
      }

      console.log("Redirecting to:", redirectPath, "User role:", data.user?.role);
      
      // Redirect after success
      setTimeout(() => navigate(redirectPath, { replace: true }), 1500);

    } catch (err) {
      console.error("❌ Error:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#364153] px-4">
      <div className="text-center mb-6">
        <h1 className="text-white text-3xl font-bold cursor-pointer">
          <Link to="/">ShopEasy.in</Link>
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-4">
          {isLogin ? (isAdminLogin ? "Admin Sign In" : "Sign In") : "Create Your Account"}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          {isLogin
            ? (isAdminLogin ? "Admin access only. Please enter your credentials." : "Please enter your email or phone number to continue.")
            : "Sign up with your details below."}
        </p>

        {/* Admin/User Toggle (Login only) */}
        {isLogin && (
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                !isAdminLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                isAdminLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin Login
            </button>
          </div>
        )}

        {/* Full Name (Signup only) */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* Admin Code (Signup only) */}
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Admin Code (Optional - for admin signup)"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mb-4">
              Enter "SHOPEASY_ADMIN_2024" to create an admin account
            </p>
          </>
        )}

        {/* Email or Phone */}
        <input
          type="text"
          placeholder="Email or Phone Number"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Confirm Password (Signup only) */}
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:opacity-90 transition cursor-pointer"
        >
          {isLogin ? "Continue" : "Sign Up"}
        </button>

        {/* Forgot Password Link (Login only) */}
        {isLogin && (
          <div className="text-center mt-3">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Toggle form link */}
        <p className="text-center text-gray-600 mt-4">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={toggleForm}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={toggleForm}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Log in
              </span>
            </>
          )}
        </p>

        {/* Error & Success Messages */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
            {success}
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmailOrPhone("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Enter your email or phone number and create a new password.
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={forgotEmailOrPhone}
                onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmailOrPhone("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in max-w-md ${
          toastType === "error" 
            ? "bg-red-500 text-white" 
            : "bg-green-500 text-white"
        }`}>
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage("")}
              className="ml-3 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

