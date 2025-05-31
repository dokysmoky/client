import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

// Main App Component
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

        <nav style={{ marginBottom: "10px" }}>
          <Link to="/" style={{ marginRight: 10 }}>
            Home
          </Link>
          {loggedInUser ? (
            <>
              <Link to="/profile" style={{ marginRight: 10 }}>
                Welcome, {loggedInUser.username}!
              </Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: 10 }}>
                Login
              </Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>

        <hr />

        <Routes>
          <Route
            path="/"
            element={
              <Listings listings={listings} loggedInUser={loggedInUser} />
            }
          />
          <Route
            path="/profile"
            element={<Profile loggedInUser={loggedInUser} />}
          />
          <Route
            path="/login"
            element={<LoginForm setLoggedInUser={setLoggedInUser} />}
          />
          <Route
            path="/register"
            element={<RegisterForm setLoggedInUser={setLoggedInUser} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

// Login Component
function LoginForm({ setLoggedInUser }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

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
        navigate("/");
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

// Register Component
function RegisterForm({ setLoggedInUser }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    bio: "",
    age: "",
  });
  const [registerError, setRegisterError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    try {
      const res = await fetch("http://localhost:5021/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        setLoggedInUser(data.user || {});
        navigate("/");
      } else {
        setRegisterError(data.error || "Registration failed");
      }
    } catch {
      setRegisterError("Server error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {["name", "surname", "username", "email", "bio", "age", "password"].map(
        (field) => (
          <div key={field}>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              required
            />
            <br />
          </div>
        )
      )}
      <button type="submit">Register</button>
      {registerError && <p style={{ color: "red" }}>{registerError}</p>}
    </form>
  );
}
// Listings Component
function Listings({ listings, loggedInUser }) {
  return (
    <>
      <h2>Listings</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {listings.map((listing) => (
          <div
            key={listing.product_id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              width: "300px",
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
                {/* 💬 Comment section */}
                <Comments productId={listing.product_id} loggedInUser={loggedInUser} />
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


// Profile Component
function Profile({ loggedInUser }) {
  if (!loggedInUser) return <p>Please log in to see your profile.</p>;

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

// Comments Component
function Comments({ productId, loggedInUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5021/comments/${productId}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [productId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await fetch("http://localhost:5021/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: loggedInUser.user_id,
        product_id: productId,
        comment_text: newComment,
      }),
    });

    setNewComment("");

    // Refresh comment list
    const updated = await fetch(`http://localhost:5021/comments/${productId}`).then((r) =>
      r.json()
    );
    setComments(updated);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Comments</h4>
      <form onSubmit={handleCommentSubmit}>
        <textarea
          rows="2"
          placeholder="Leave a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
          style={{ width: "100%" }}
        />
        <button type="submit">Post</button>
      </form>
      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {comments.map((comment) => (
          <li key={comment.comment_id} style={{ marginTop: "8px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>
            <strong>{comment.username}:</strong> {comment.comment_text}
            <br />
            <small>{new Date(comment.comment_date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
