import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";

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
      <div className="App">
        <h1>KPOP Photocard Marketplace</h1>

      <nav>
  <Link to="/">Home</Link> {}
  {loggedInUser ? (
    <>
      <Link to="/add-listing">Add Listing</Link>
      <Link to="/wishlist">Wishlist</Link> {}
      <Link to="/profile">Welcome, {loggedInUser.username}!</Link>
      <Link to="/cart">Cart</Link>
      <button onClick={handleLogout}>Logout</button>    </>
  ) : (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  )}
</nav>



        <Routes>
          <Route
            path="/"
            element={
              <Listings
                listings={listings}
                loggedInUser={loggedInUser}
                setLoggedInUser={setLoggedInUser}
              />
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
          <Route
            path="/add-listing"
            element={<AddListingForm loggedInUser={loggedInUser} fetchListings={fetchListings}/>}
          />
          <Route
            path="/wishlist"
            element={<Wishlist loggedInUser={loggedInUser} />}
            />
          <Route 
           path="/cart"
           element={<Cart loggedInUser={loggedInUser} />} />

        </Routes>
      </div>
    </Router>
  );
}

// ---------- LOGIN FORM ----------
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
      <input
        type="password"
        placeholder="Password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {loginError && <p className="error">{loginError}</p>}
    </form>
  );
}

// ---------- REGISTER FORM ----------
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
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            name={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={handleChange}
            required
          />
        )
      )}
      <button type="submit">Register</button>
      {registerError && <p className="error">{registerError}</p>}
    </form>
  );
}

// ---------- LISTINGS ----------
/*function Listings({ listings, loggedInUser, setLoggedInUser }) {

  const handleAddToCart = async (productId) => {
  if (!loggedInUser) {
    alert("You must be logged in to add to cart");
    return;
  }

  try {
    const res = await fetch("http://localhost:5021/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: loggedInUser.user_id,
        product_id: productId,
        quantity: 1
      }),
    });
    const data = await res.json(); // Parse the response

    if (res.ok) {
      if (data.alreadyExists) {
        alert("You have already added this item to your cart");
      } else {
        alert("Item added to cart");
      }
    } else {
      throw new Error(data.error || "Failed to add to cart");
    }
  } catch (err) {
    console.error("Error adding to cart:", err); 

    alert("Could not add to cart");
  }
};

const handleAddToWishlist = async (productId) => {
  if (!loggedInUser) {
    alert("You must be logged in to add to wishlist");
    return;
  }

  try {
    const res = await fetch("http://localhost:5021/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: loggedInUser.user_id,
        product_id: productId,
      }),
    });

    const data = await res.json(); // Parse the response

    if (res.ok) {
      if (data.alreadyExists) {
        alert("You have already added this item to your wishlist.");
      } else {
        alert("Item added to wishlist!");
      }
    } else {
      throw new Error(data.error || "Failed to add to wishlist");
    }
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    alert("Could not add to wishlist");
  }
};


  return (
    <>
      <h2>Listings</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {listings.map((listing) => (
          <div className="listing-card" key={listing.product_id}>
            <h3>{listing.listing_name}</h3>
            <img
              src={listing.photo || "https://via.placeholder.com/200"}
              alt={listing.listing_name}
            />
            <p><strong>Price:</strong> €{Number(listing.price).toFixed(2)}</p>
            <p><strong>Condition:</strong> {listing.condition}</p>
            <p>{listing.description}</p>

            {loggedInUser ? (
              <div className="listing-actions">
                <button onClick={() => handleAddToWishlist(listing.product_id)}>❤️ Wishlist</button>
                <button onClick={() => handleAddToCart(listing.product_id)}>🛒 Buy</button>
                <Comments productId={listing.product_id} loggedInUser={loggedInUser} />
              </div>
            ) : (
              <p style={{ fontStyle: "italic" }}>Login to interact</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}*/
function Listings({ listings, loggedInUser, setLoggedInUser }) {
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: parseInt(value) });
  };

  const handleAddToCart = async (productId) => {
    if (!loggedInUser) {
      alert("You must be logged in to add to cart");
      return;
    }

    const quantity = quantities[productId] || 1;

    try {
      const res = await fetch("http://localhost:5021/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          product_id: productId,
          quantity: quantity,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.alreadyExists) {
          alert("You have already added this item to your cart");
        } else {
          alert("Item added to cart");
        }
      } else {
        throw new Error(data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Could not add to cart");
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!loggedInUser) {
      alert("You must be logged in to add to wishlist");
      return;
    }

    try {
      const res = await fetch("http://localhost:5021/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          product_id: productId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.alreadyExists) {
          alert("You have already added this item to your wishlist.");
        } else {
          alert("Item added to wishlist!");
        }
      } else {
        throw new Error(data.error || "Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Could not add to wishlist");
    }
  };

  return (
    <>
      <h2>Listings</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {listings.map((listing) => (
          <div className="listing-card" key={listing.product_id}>
            <h3>{listing.listing_name}</h3>
            <img
              src={listing.photo || "https://via.placeholder.com/200"}
              alt={listing.listing_name}
            />
            <p><strong>Price:</strong> €{Number(listing.price).toFixed(2)}</p>
            <p><strong>Condition:</strong> {listing.condition}</p>
            <p>{listing.description}</p>

            {loggedInUser ? (
              <div className="listing-actions">
                <button onClick={() => handleAddToWishlist(listing.product_id)}>❤️ Wishlist</button>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "5px" }}>
                  <input
                    type="number"
                    min="1"
                    value={quantities[listing.product_id] || 1}
                    onChange={(e) => handleQuantityChange(listing.product_id, e.target.value)}
                    style={{ width: "60px" }}
                  />
                  <button onClick={() => handleAddToCart(listing.product_id)}>🛒 Buy</button>
                </div>

                <Comments productId={listing.product_id} loggedInUser={loggedInUser} />
              </div>
            ) : (
              <p style={{ fontStyle: "italic" }}>Login to interact</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- PROFILE ----------
function Profile({ loggedInUser }) {
  if (!loggedInUser) return <p>Please log in to see your profile.</p>;

  const { name, surname, username, email, address, bio, age, profilePicture } = loggedInUser;

  return (
    <div>
      <h2>Your Profile</h2>
      <img
        src={profilePicture || "https://via.placeholder.com/150"}
        alt={`${username}'s profile`}
        style={{ width: "150px", borderRadius: "50%" }}
      />
      <p><strong>Name:</strong> {name} {surname}</p>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Age:</strong> {age || "N/A"}</p>
      <p><strong>Address:</strong> {address || "N/A"}</p>
      <p><strong>Bio:</strong> {bio || "No bio set"}</p>

      
    </div>
  );
}

// ---------- COMMENTS ----------
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
    const updated = await fetch(`http://localhost:5021/comments/${productId}`).then((r) =>
      r.json()
    );
    setComments(updated);
  };

  return (
    <div className="comment-box">
      <form onSubmit={handleCommentSubmit}>
        <textarea
          rows="2"
          placeholder="Leave a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">Post</button>
      </form>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {comments.map((comment) => (
          <li key={comment.comment_id}>
            <strong>{comment.username}:</strong> {comment.comment_text}
            <br />
            <small>{new Date(comment.comment_date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- ADD LISTING ----------
function AddListingForm({ loggedInUser, fetchListings }) {
  const navigate = useNavigate();
  const [listingData, setListingData] = useState({
    listing_name: "",
    price: "",
    condition: "",
    description: "",
    photo: "",
  });

  const handleChange = (e) => {
    setListingData({ ...listingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedInUser || !loggedInUser.user_id) {
      alert("You must be logged in to create a listing.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5021/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...listingData,
          user_id: loggedInUser.user_id,
        }),
      });

      if (res.ok) {
          await fetchListings(); 
        navigate("/");
      } else {
        const err = await res.json();
        alert("Failed to add listing: " + (err.error || res.statusText));
      }
    } catch (err) {
      console.error("Error creating listing", err);
      alert("An error occurred. See console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a New Listing</h2>
      <input
        name="listing_name"
        placeholder="Photocard Name"
        value={listingData.listing_name}
        onChange={handleChange}
        required
      />
      <input
        name="price"
        type="number"
        placeholder="Price"
        value={listingData.price}
        onChange={handleChange}
        required
      />
      <input
        name="condition"
        placeholder="Condition (e.g., New, Good)"
        value={listingData.condition}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={listingData.description}
        onChange={handleChange}
        required
      />
      <input
        name="photo"
        placeholder="Photo URL"
        value={listingData.photo}
        onChange={handleChange}
      />
      <button type="submit">Create Listing</button>
    </form>
  );
}
function Wishlist({ loggedInUser }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`http://localhost:5021/wishlist/${loggedInUser.user_id}`);
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data = await res.json();
        setWishlistItems(data);
      } catch (err) {
        console.error("Error loading wishlist:", err);
      }
    };

    fetchWishlist();
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <p>Please log in to view your wishlist.</p>;
  }

  return (
    <div>
      <h2>Your Wishlist</h2>
      {wishlistItems.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {wishlistItems.map((item) => (
            <div className="listing-card" key={item.product_id}>
              <h3>{item.listing_name}</h3>
              <img
                src={item.photo || "https://via.placeholder.com/200"}
                alt={item.listing_name}
              />
              <p><strong>Price:</strong> €{Number(item.price).toFixed(2)}</p>
              <p><strong>Condition:</strong> {item.condition}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Cart({ loggedInUser }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchCart = async () => {
      try {
        const res = await fetch(`http://localhost:5021/cart/${loggedInUser.user_id}`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };

    fetchCart();
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <p>Please log in to view your cart.</p>;
  }

  const handleRemove = async (productId) => {
    try {
      const res = await fetch("http://localhost:5021/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          product_id: productId,
        }),
      });

      if (!res.ok) throw new Error("Failed to remove item");
      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error("Error removing from cart:", err);
      alert("Could not remove item");
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {cartItems.map((item) => (
            <div className="listing-card" key={item.product_id}>
              <h3>{item.listing_name}</h3>
              <img
                src={item.photo || "https://via.placeholder.com/200"}
                alt={item.listing_name}
              />
              <p><strong>Price:</strong> €{Number(item.price).toFixed(2)}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <button onClick={() => handleRemove(item.product_id)}>❌ Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default App;
