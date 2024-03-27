import "./navbar.css";
import Notification from "../../img/notification.svg";
import { useEffect, useState } from "react";

const Navbar = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.on("getNotification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });
  }, [socket]);

  /*  useEffect(() => {
      socket.on("SendNotif", (msg) => {
        alert(msg); // Afficher une alerte avec le message reçu
      });
  }, [socket]);*/

  const displayNotification = ({ message }) => {
    
    return (
      <span className="notification">{`${message}`}</span>
    );
  };

  const handleRead = async () => {
    setNotifications([]);
    setOpen(false);
    const ConnectedUser = localStorage.getItem('userData');

    const response = await fetch(`http://localhost:5000/api/notification/notifications/${ConnectedUser}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          params: JSON.stringify({ userId: ConnectedUser }),
        });
        if (response.ok) {
          const data1 = await response.json();
          console.log(data1)
        }
  };

  return (
    <div className="navbar">
      <span className="logo">Projet OSC</span>
      <div className="icons">
        <div className="icon" onClick={() => setOpen(!open)}>
          <img src={Notification} className="iconImg" alt="" />
          {
notifications.length >0 &&
            <div className="counter">{notifications.length}</div>
          }
        </div>
        
      </div>
      {open && (
        <div className="notifications">
          {notifications.map((n) => displayNotification(n))}
          <button className="nButton" onClick={handleRead}>
            Marquer comme lu(s)
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
