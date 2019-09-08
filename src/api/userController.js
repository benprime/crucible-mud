import User from '../models/user';
import Character from '../models/character';
import { check, validationResult } from 'express-validator';
import config from '../config';
import bcrypt from 'bcrypt';
import { sendMail } from './mailUtility';
import { randomBytes } from 'crypto';

exports.createUser = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {

    const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
    const passHash = await bcrypt.hash(req.body.password, salt);

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