const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/utilisateurs');

exports.signup = async (req, res, next) => {
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

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      user: userWithoutPassword,
      message: 'Utilisateur créé avec succès',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
      expiresIn: '24h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
