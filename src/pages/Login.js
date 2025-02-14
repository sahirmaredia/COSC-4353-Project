import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize the navigate function

  // Mock user data stored in localStorage for testing
  const mockUsers = JSON.parse(localStorage.getItem("users") || "[]");

  // Validate email and password fields
  const validateForm = () => {
    if (!email || !password) return "Both fields are required!";
    if (!email.includes("@")) return "Enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Check if the entered email and password match an existing account
  const isUserAuthenticated = (email, password) => {
    const user = mockUsers.find(user => user.email === email);
    return user && user.password === password ? user : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const user = isUserAuthenticated(email, password);
    if (!user) {
      setError("Invalid email or password");
      return;
    }

    setError(""); // Clear any previous errors
    console.log("Logging in...", { email, role: user.role });

    // Temporarily store email in localStorage for testing
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", user.role);

    // Redirect to profile page after successful login
    navigate("/profile");
  };

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-btn">Login</button>
      </form>
      <p>
        Not registered? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
