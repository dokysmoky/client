import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

function App() {
  const [listings, setListings] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const res = await fetch("http://localhost:5021/listings");
    const data = await res.json();
    setListings(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLoggedInUser(null);
  };

  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>KPOP Photocard Marketplace</h1>

        {loggedInUser ? (
          <div>
            {/* User clicks their username to go to profile */}
            <Link to="/profile" style={{ marginRight: 10 }}>
              Welcome, {loggedInUser.username}!
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <LoginForm setLoggedInUser={setLoggedInUser} />
        )}

        <hr />

        <Routes>
          <Route
            path="/"
            element={<Listings listings={listings} loggedInUser={loggedInUser} />}
          />
          <Route
            path="/profile"
            element={<Profile loggedInUser={loggedInUser} />}
          />
          {/* Add more routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
}

// LoginForm extracted for cleanliness
function LoginForm({ setLoggedInUser }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("http://localhost:5021/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoggedInUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Server error");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">Login</button>
      {loginError && <p style={{ color: "red" }}>{loginError}</p>}
    </form>
  );
}

function Listings({ listings, loggedInUser }) {
  return (
    <>
      <h2>Listings</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {listings.map((listing) => (
          <div
            key={listing.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              width: "250px",
            }}
          >
            <h3>{listing.listing_name}</h3>
            <img
              src={listing.photo || "https://via.placeholder.com/200"}
              alt={listing.listing_name}
              style={{ width: "100%", height: "auto" }}
            />
            <p>
              <strong>Price:</strong> €{Number(listing.price).toFixed(2)}
            </p>
            <p>
              <strong>Condition:</strong> {listing.condition}
            </p>
            <p>{listing.description}</p>

            {loggedInUser ? (
              <>
                <button>❤️ Wishlist</button>
                <button>🛒 Buy</button>
                <button>💬 Comment</button>
              </>
            ) : (
              <p style={{ fontStyle: "italic" }}>Login to interact</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// Profile page component
function Profile({ loggedInUser }) {
  // If not logged in, show a message or redirect to login
  if (!loggedInUser) {
    return <p>Please log in to see your profile.</p>;
  }

  // Assume these properties exist on loggedInUser object
  const {
    name,
    surname,
    username,
    email,
    wishlist,
    address,
    bio,
    age,
    profilePicture,
  } = loggedInUser;

  return (
    <div>
      <h2>Your Profile</h2>
      <img
        src={profilePicture || "https://via.placeholder.com/150"}
        alt={`${username}'s profile`}
        style={{ width: 150, borderRadius: "50%" }}
      />
      <p>
        <strong>Name:</strong> {name} {surname}
      </p>
      <p>
        <strong>Username:</strong> {username}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Age:</strong> {age || "N/A"}
      </p>
      <p>
        <strong>Address:</strong> {address || "N/A"}
      </p>
      <p>
        <strong>Bio:</strong> {bio || "No bio set"}
      </p>

      <h3>Your Wishlist</h3>
      {wishlist && wishlist.length > 0 ? (
        <ul>
          {wishlist.map((item) => (
            <li key={item.id}>{item.listing_name}</li>
          ))}
        </ul>
      ) : (
        <p>Your wishlist is empty.</p>
      )}
    </div>
  );
}

export default App;
