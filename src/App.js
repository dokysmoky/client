import React, { useState } from "react";

function App() {
  // User form state (keep as is)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userResponse, setUserResponse] = useState(null);

  // Listing form state - updated to match your DB columns
  const [listingName, setListingName] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");  // new field
  const [price, setPrice] = useState("");
  const [userId, setUserId] = useState(""); // corresponds to user_id in DB
  const [photo, setPhoto] = useState(""); // optional
  const [listingResponse, setListingResponse] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5021/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const data = await res.json();
    setLoginResponse(data);
  };
  
  // Add user POST request (no change)
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

  // Add listing POST request - updated keys to match DB
  const handleAddListing = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5021/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_name: listingName,
        description,
        condition,
        price: parseFloat(price),
        user_id: parseInt(userId),
        photo, // send photo url or empty string
      }),
    });
    const data = await res.json();
    setListingResponse(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add User</h1>
      <form onSubmit={handleAddUser}>
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
        <button type="submit">Add User</button>
      </form>
      {userResponse && <pre>{JSON.stringify(userResponse, null, 2)}</pre>}

      <hr />

      <h1>Add Listing</h1>
      <form onSubmit={handleAddListing}>
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
          type="number"
          placeholder="User ID (seller)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
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
      {listingResponse && <pre>{JSON.stringify(listingResponse, null, 2)}</pre>}

      <hr />

<h1>Login</h1>
<form onSubmit={handleLogin}>
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
</form>
{loginResponse && <pre>{JSON.stringify(loginResponse, null, 2)}</pre>}

    </div>
  );
}

export default App;
