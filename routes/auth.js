const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const {registerValidation, loginValidation} = require('../validation');

router.post('/register', async(req, res) => {

  //Validate The Data Before Add A new user
  const {error} = registerValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message); //had to install joi@15.0.3 to make this works

  //Checking if the user is already in the database
  const emailExist = await User.findOne({email: req.body.email});
  if(emailExist) return res.status(400).send('Email Already Exist');

  //Encrypt(Hash) the passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //create new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  });
  try {
    const savedUser = await user.save();
    res.send({user: user.id});
  } catch (e) {
    res.status(400).send(e);
  }
});

//Login
router.post('/login', async (req, res) => {
  const {error} = loginValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({email: req.body.email});
  if(!user) return res.status(400).send('Email is not exist');

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).send('Access Denied');

  res.send('Login Successful!');
});

module.exports = router; //had to add this to solve middlewares object issue
