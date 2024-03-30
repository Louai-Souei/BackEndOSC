const User = require('../models/utilisateurs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
exports.createUser = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      user: newUser,
      message: 'Utilisateur créé avec succès',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const updatedUserData = req.body; 
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      for (const key in updatedUserData) {
        if (Object.hasOwnProperty.call(updatedUserData, key)) {
          user[key] = updatedUserData[key];
        }
      }
      await user.save();
  
      res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.deleteUser = async (req, res, next) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      await User.deleteOne({ _id: userId }); 
  
      res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  