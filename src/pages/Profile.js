import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import { jwtDecode } from 'jwt-decode';

const states = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const skillsList = [
  { value: "First Aid", label: "First Aid" },
  { value: "Cooking", label: "Cooking" },
  { value: "Teaching", label: "Teaching" },
  { value: "Construction", label: "Construction" },
  { value: "Event Planning", label: "Event Planning" },
  { value: "Fundraising", label: "Fundraising" },
  { value: "Public Speaking", label: "Public Speaking" },
  { value: "Grant Writing", label: "Grant Writing" },
  { value: "Community Outreach", label: "Community Outreach" },
  { value: "Conflict Resolution", label: "Conflict Resolution" },
  { value: "Social Media Management", label: "Social Media Management" },
  { value: "Mentoring", label: "Mentoring" },
  { value: "Crisis Counseling", label: "Crisis Counseling" },
  { value: "Disaster Response", label: "Disaster Response" },
  { value: "Administrative Support", label: "Administrative Support" },
];

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [dateInput, setDateInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch profile data when component mounts
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/profile", {
        method: "GET",
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
  
      const data = await response.json();
      console.log("Profile data:", data);
  
      // Format skills for react-select
      const formattedSkills = data.user.skills.map(skill => ({
        value: skill,
        label: skill,
      }));
  
      setProfile(data.user); // Update the profile state
      setSelectedSkills(formattedSkills); // Update selectedSkills state
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!profile.fullName.trim() || profile.fullName.length > 50)
      newErrors.fullName = "Full Name is required (max 50 characters).";

    if (!profile.address1.trim() || profile.address1.length > 100)
      newErrors.address1 = "Address 1 is required (max 100 characters).";

    if (!profile.city.trim() || profile.city.length > 100)
      newErrors.city = "City is required (max 100 characters).";

    if (!profile.state) newErrors.state = "State selection is required.";

    if (!/^\d{5}(-\d{4})?$/.test(profile.zip))
      newErrors.zip = "Enter a valid ZIP code (5 or 9 digits).";

    if (!profile.skills || profile.skills.length === 0)
      newErrors.skills = "At least one skill selection is required.";

    if (!profile.availability || profile.availability.length === 0)
      newErrors.availability = "Select at least one availability date.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: 'include', // Send cookies
      });
  
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
  
      // Clear local storage and redirect to login
      localStorage.removeItem("userProfile");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleSkillsChange = (selectedOptions) => {
    const skillsValues = selectedOptions.map(option => option.value); // Extract skill values
    setSelectedSkills(selectedOptions);
    setProfile(prev => ({
      ...prev,
      skills: skillsValues
    }));
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDateInput(selectedDate);
  };

  const addDate = () => {
    if (dateInput && !profile.availability.includes(dateInput)) {
      setProfile((prev) => ({
        ...prev,
        availability: [...prev.availability, dateInput].sort(),
      }));
      setDateInput("");
    }
  };

  const removeDate = (dateToRemove) => {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.filter((date) => date !== dateToRemove),
    }));
  };

  const formatDate = (dateString) => {
    // Create date object and adjust for local timezone
    const date = new Date(dateString + 'T00:00:00');
    
    // Use toLocaleDateString with explicit timezone handling
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'  // This ensures the date isn't affected by local timezon
    });
  };

  const validateZip = (zip) => {
    return /^\d{5}(-\d{4})?$/.test(zip);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validate()) return; // Run validation before submission
  
    try {
      const response = await fetch("http://localhost:5000/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profile),
      });
  
      const result = await response.json();
      console.log("Response from server:", result);
  
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }
  
      // Format skills for react-select
      const formattedSkills = result.user.skills.map(skill => ({
        value: skill,
        label: skill,
      }));
  
      setProfile(result.user); // Update the profile state
      setSelectedSkills(formattedSkills); // Update selectedSkills state
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          maxLength="50"
          required
          value={profile.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

        <input
          type="text"
          name="address1"
          placeholder="Address 1"
          maxLength="100"
          required
          value={profile.address1}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
         {errors.address1 && <p className="text-red-500 text-sm">{errors.address1}</p>}
        <input
          type="text"
          name="address2"
          placeholder="Address 2 (Optional)"
          maxLength="100"
          value={profile.address2}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
         {errors.address2 && <p className="text-red-500 text-sm">{errors.address2}</p>}
        <input
          type="text"
          name="city"
          placeholder="City"
          maxLength="100"
          required
          value={profile.city}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
         {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

        <select 
          name="state" 
          required 
          value={profile.state}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}

        <input
          type="text"
          name="zip"
          placeholder="Zip Code"
          maxLength="10"
          minLength="5"
          required
          value={profile.zip}
          onChange={handleChange}
          onBlur={(e) => {
            if (!validateZip(e.target.value)) {
              alert("Please enter a valid Zip Code (e.g., 12345 or 12345-6789).");
            }
          }}
          className="w-full p-2 border rounded"
        />
         {errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}

        <div className="space-y-2">
          <h4 className="font-medium">Select Skills:</h4>
          <Select
            name="skills"
            options={skillsList}
            isMulti
            value={selectedSkills}
            onChange={handleSkillsChange}
            placeholder="Select skills..."
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        {errors.skills && <p className="error">{errors.skills}</p>}


        <textarea
          name="preferences"
          value={profile.preferences}
          placeholder="Preferences (Optional)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="4"
        ></textarea>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Add Available Dates:</label>
          <div className="flex gap-2">
            <input 
              name="availableDates"
              type="date" 
              value={dateInput}
              onChange={handleDateChange}
              className="border rounded p-2 flex-grow"
            />
            <button 
              type="button"
              onClick={addDate}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Date
            </button>
          </div>
        </div>
        {errors.availability && <p className="error">{errors.availability}</p>}

        {profile.availability.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Selected Dates:</h4>
            <ul className="space-y-2">
              {profile.availability.map((date, index) => (
                <li 
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span>{formatDate(date)}</span>
                  <button
                    type="button"
                    onClick={() => removeDate(date)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Save Profile
        </button>
        <button 
        onClick={handleLogout} 
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
        </div>
    </form>
  );
};

export default Profile;