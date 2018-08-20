/**
 * This file is meant to hold errors returned by promises during the normal gameplay.
 * This would be for common error when a user mistypes an item name, moves in an
 * invalid direction, etc. Ie, These are the errors that you would not care to log.
 * Note: These errors mainly exist to give developers something more reliable to
 * to key game logic off of rather than just an error string returned from a rejected
 * promise.
 */
class OfferNotFoundError extends Error {}
class AutocompleteNotFoundError extends Error {}
class UserNotInRoomError extends Error {}
class InsufficientFundsError extends Error {}
class ItemNotFoundError extends Error {}



export default {
  OfferNotFoundError,
  ItemNotFoundError,
  AutocompleteNotFoundError,
  UserNotInRoomError,
  InsufficientFundsError,
};