import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate(); // Define navigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(null); // Default role
  const [error, setError] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    // Set role from localStorage if it exists, otherwise set default to "volunteer"
    setRole(storedRole || "volunteer");
  }, []);

  // Validate the form input
  const validateForm = () => {
    if (!email.includes("@")) return "Enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  // Check if the email is already registered
  const isEmailRegistered = (email) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.some((user) => user.email === email);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if the email is already registered
    if (isEmailRegistered(email)) {
      setError("Email is already registered");
      return;
    }

    setError(""); // Clear any previous errors
    console.log("Registering...", { email, role });

    // Save the new user data in localStorage
    const newUser = { email, password, role };
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));


    // Optionally store role or other data in localStorage
    localStorage.setItem("userRole", role);

    // Redirect to the login page or dashboard after successful registration
    navigate("/");
  };

  if (role === null) {
    return <div>Loading...</div>; // Wait until the role is retrieved
  }

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
            />
            Admin
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="volunteer"
              checked={role === "volunteer"}
              onChange={() => setRole("volunteer")}
            />
            Volunteer
          </label>
        </div>
        <button type="submit" className="register-btn">Register</button>
      </form>
    </div>
  );
}

export default Register;
