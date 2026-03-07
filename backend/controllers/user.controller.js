const bcrypt = require('bcrypt')
const User = require('../backend/models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../utils/config/config')
const authService = require('./services/auth.service')

const register = async (request, response) => {
  const user = await authService.register(request.body)
  response.status(201).json(user)
}

const login = async (request, response) => {
  const {token, user} = authService.login(request.body)
  response
  .status(200)
  .send({ token, username: user.username, firstName: user.firstName, lastName: user.lastName })
}

const updateProfile = async (request, response) => {
    const userId = request.user?.id || request.user?._id;

    const allowedFields = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "profilePhoto"
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (request.body[field] !== undefined) {
        updates[field] = request.body[field];
      }
    }

    const updateOps = {$set: updates}

    if (updates.username) {
      const usernameTaken = await User.findOne({
        username: updates.username,
        _id: { $ne: userId }
      });

      if (usernameTaken) {
        return response.status(409).json({ error: "username already exists" });
      }
    }
    if (updates.email) {
      const emailTaken = await User.findOne({
        email: updates.email,
        _id: { $ne: userId }
      });

      if (emailTaken) {
        return response.status(409).json({ error: "email already exists" });
      }

      updateOps.$inc = { tokenVersion: 1 };
    }
    if (updates.phone) {
      const phoneTaken = await User.findOne({
        phone: updates.phone,
        _id: { $ne: userId }
      });

      if (phoneTaken) {
        return response.status(409).json({ error: "phone already exists" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateOps,
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) {
      return response.status(404).json({ error: "user not found" });
    }

    return response.status(200).json(updatedUser);
}

const updatePassword = async (request, response) => {
  const updatedUser = authService.updatePassword(request.body)
  return response.status(200).json(updatedUser);
}

const createAddress = async (request, response) => {
    const {country, city, postalcode, street, building, floor, special_mark} = request.body

    const user = request.user

    const newAddress = {
        country,
        city,
        postalcode,
        street,
        building,
        floor,
        special_mark
    };

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $push: { addresses: newAddress } },
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) {
      return response.status(404).json({ error: "user not found" });
    }

    return response.status(201).json({
      message: "Address added successfully",
      addresses: updatedUser.addresses
    });
}

const updateAddress = async (request, response) => {
    const user = request.user
    const {addressId} = request.params

    if (!addressId) {
      return response.status(400).json({ error: "addressId is required" });
    }

    const allowedFields = [
      "country",
      "city",
      "street",
      "building",
      "postalcode",
      "special_mark",
      "floor"
    ];

    const setOps = {};
    for (const field of allowedFields) {
      if (request.body[field] !== undefined) {
        setOps[`addresses.$.${field}`] = request.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      {_id: user.id, "addresses._id": addressId},
      {$set: setOps},
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) {
      return response.status(404).json({ error: "user not found" });
    }

    return response.status(200).json({
      message: "Address updated successfully",
      addresses: updatedUser.addresses
    });}

module.exports = { register, login, updateProfile, updatePassword, createAddress, updateAddress }