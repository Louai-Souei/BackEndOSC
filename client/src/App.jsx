import { useEffect, useState } from "react";
import "./app.css";
import Navbar from "./components/navbar/Navbar";
import { io } from "socket.io-client";
import jwt from "jsonwebtoken";

const App = () => {
  const [email, SetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io("http://localhost:8000"));
  }, []);
  const loginUser = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      //setUser(email);
     // console.log(data)
      const decodedToken = jwt.decode(data.token);
      localStorage.setItem('userData', decodedToken.userId);
        if (decodedToken && decodedToken.userId) {
          setUser(decodedToken.userId);}
          socket?.emit("userLoggedIn", decodedToken.userId);

          const response1 = await fetch(`http://localhost:5000/api/notification/notifications/${decodedToken.userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          params: JSON.stringify({ userId: decodedToken.userId }),
        });
        if (response1.ok) {
          const data1 = await response1.json();
          console.log(data1)
        }


    } else {
      //console.log("Email ou mot de passe incorrect");
      alert("Email ou mot de passe incorrect");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
  }
};



  useEffect(() => {
    socket?.emit("newUser", user);
  }, [socket, user]);

  return (
    <div className="container">
      {user ? (
        <>
          <Navbar socket={socket} />
          <span className="email">{user}</span>
        </>
      ) : (
        <div className="login">
          <h2>Projet OSC</h2>
          <input
            type="text"
            placeholder="email"
            onChange={(e) => SetEmail(e.target.value)}
          />
          <input
            type="password" 
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={loginUser}>Se connecter</button>
        </div>
      )}
    </div>
  );
};

export default App;
