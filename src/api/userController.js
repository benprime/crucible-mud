import User from '../models/user';
import Character from '../models/character';
import { check, validationResult } from 'express-validator';
import config from '../config';
import bcrypt from 'bcrypt';
import { sendMail } from './mailUtility';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { tokenCache } from '../core/authentication';

exports.createUser = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const passHash = await bcrypt.hash(req.body.password, config.BCRYPT_SALT_ROUNDS);
    const emailHash = randomBytes(48).toString('hex');

    const user = await User.create({
      email: req.body.email,
      password: passHash,
      verified: false,
      verifyHash: emailHash,
    });

    Character.create({
      user: user,
      name: req.body.username,
      currency: 50,
      xp: 0,
      level: 1,
      maxHP: 10,
      currentHP: 10,
      attacksPerRound: 1,

      stats: {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        charisma: 10,
        constitution: 10,
        willpower: 10,
      },
    });

    const emailContents = `Verify it already! http://localhost:3000/api/user/verify/${emailHash}`;
    sendMail({
      from: 'noreply@cruciblemud.com',
      to: user.email,
      subject: 'CrucibleMUD: Verify your account',
      text: emailContents,
      html: emailContents,
    });

    res.json({
      status: true,
    });
  } catch (err) {
    // unique index violation
    if (err.code == 11000) {
      return res.status(409)
        .json({ status: false, message: 'User already exists.' });
    }
    next(err);
  }
};

exports.validateCreateUser = () => {
  return [
    check('email', 'Email is required.').exists(),
    check('email', 'Invalid email').isEmail(),
    check('username', 'Username is required.').exists(),
    check('password', 'Password is required.').exists(),
  ];
};

exports.verifyUser = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  var user = await User.findOne({ verifyHash: req.params.verifyHash });
  if (user) {
    user.verifyHash = null;
    user.verified = true;
    user.save();

    // TODO: redirect them to the game, rather than returning status.
    res.json({
      status: true,
    });
  } else {
    // TODO: redirect to client page with error
    return res.status(409)
      .json({ status: false, message: 'User already verified.' });
  }
};

exports.login = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ status: false, message: 'Unknown user.' });
  }

  if (!user.verified) {
    return res.status(400).json({ status: false, message: 'This user must be verified.' });
  }

  var passResult = await bcrypt.compare(req.body.password, user.password);
  if (!passResult) {
    return res.status(400).json({ status: false, message: 'Password authentication failed.' });
  }

  let token = jwt.sign({
    data: user.id,
  }, config.TOKEN_SECRET, { expiresIn: '1h' });

  tokenCache[token] = user;

  res.json({
    status: true,
    token: token,
  });
};

exports.validateLogin = () => {
  return [
    check('email', 'Email is required.').exists(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'Password is required.').exists(),
  ];
};

exports.logout = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  delete tokenCache[req.body.token];

  res.json({
    status: true,
  });
};