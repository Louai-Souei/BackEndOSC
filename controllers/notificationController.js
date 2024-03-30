const { io, onlineUsers } = require("../socket/socketServer");
const Notification = require("../models/notifications");

exports.sendNotification = async (req, res, next) => {
  try {
    const { userSocketId, notif_body } = req.notificationdetails;

    io.to(userSocketId).emit("SendNotif", notif_body);
    io.to(userSocketId).emit("getNotification", {
      message: notif_body,
    });
  } catch (error) {

    if (res && res.status && res.json) {
      res
        .status(500)
        .json({ message: "Internal server error sending notification" });
    }
  }
};

exports.getNotificationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user: userId });
    if (!notifications || notifications.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune notification trouvée pour cet utilisateur" });
    }
    let i = 0;
    notifications[0].messages.forEach(async (message) => {
      i += 1;
      const existingUser = onlineUsers.find((user) => user.userId === userId);
      if (existingUser) {
        req.notificationdetails = {
          userSocketId: existingUser.socketId,
          notif_body: message,
        };

        await this.sendNotification(req, res, async () => {
          res
            .status(200)
            .json({ message: "Utilisateurs récupérés avec succès" });
        });
      }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("user");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addNotification = async (req, res) => {
  const { userId, newMessage } = req.body;

  
  
  try {
    let notification = await Notification.findOne({ user: userId });

    if (!notification) {
      const newNotification = new Notification({
        user: userId,
        messages: [newMessage],
      });
      notification = await newNotification.save();
    } else {
      notification.messages.push(newMessage);
      await notification.save();
    }

  } catch (error) {
  }
};
exports.deleteNotificationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedNotification = await Notification.findOneAndDelete({
      user: userId,
    });

    if (!deletedNotification) {
      return res
        .status(404)
        .json({ message: "Aucune notification trouvée pour cet utilisateur" });
    }

    res.json({
      message: "Notification supprimée avec succès pour cet utilisateur",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.CheckNotificationsInQueue = async (req, res) => {
  try {
  } catch (error) {}
};
