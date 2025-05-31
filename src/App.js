import React, { useState, useEffect } from "react";

function App() {
  const [listings, setListings] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // For registration
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userResponse, setUserResponse] = useState(null);

  // For login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  // For listing creation
  const [listingName, setListingName] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState("");
  const [listingResponse, setListingResponse] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLoggedInUser(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5021/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    setUserResponse(data);
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    if (!loggedInUser) return;

    const res = await fetch("http://localhost:5021/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_name: listingName,
        description,
        condition,
        price: parseFloat(price),
        user_id: loggedInUser.id,
        photo,
      }),
    });

    const data = await res.json();
    setListingResponse(data);
    fetchListings();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>KPOP Photocard Marketplace</h1>

      {loggedInUser ? (
        <div>
          <p>Welcome, {loggedInUser.username}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
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

          <hr />

          <form onSubmit={handleAddUser}>
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <br />
            <button type="submit">Register</button>
          </form>
          {userResponse && <pre>{JSON.stringify(userResponse, null, 2)}</pre>}
        </>
      )}

      <hr />

      {loggedInUser && (
        <form onSubmit={handleAddListing}>
          <h2>Add New Listing</h2>
          <input
            type="text"
            placeholder="Listing Name"
            value={listingName}
            onChange={(e) => setListingName(e.target.value)}
            required
          />
          <br />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <br />
          <input
            type="text"
            placeholder="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          />
          <br />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
          />
          <br />
          <input
            type="text"
            placeholder="Photo URL (optional)"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
          <br />
          <button type="submit">Add Listing</button>
        </form>
      )}
      {listingResponse && <pre>{JSON.stringify(listingResponse, null, 2)}</pre>}

      <hr />

      <h2>All Listings</h2>
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
            <p><strong>Price:</strong> €{Number(listing.price).toFixed(2)}</p>
            <p><strong>Condition:</strong> {listing.condition}</p>
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
    </div>
  );
}

export default App;
