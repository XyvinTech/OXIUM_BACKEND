const createError = require('http-errors')
const USER = require('../models/userSchema')
const axios = require('axios');
require('dotenv').config();

const generateToken = require('../utils/generateToken');

const token = generateToken(process.env.AUTH_SECRET);


// Get user's vehicles
exports.getUserVehicles = async (req, res) => {
    const vehicleServiceUrl = process.env.VEHICLE_SERVICE_URL
    if (!vehicleServiceUrl) return res.status(400).json({ status: false, message: 'VEHICLE_SERVICE_URL not set in env' })
  
    const user = await USER.findOne({ _id: req.params.userId }, 'vehicle defaultVehicle')
    if (!user) return res.status(404).json({ status: false, message: 'User not found' })
  
    // @ts-ignore
    let apiResponse = await axios.post(`${vehicleServiceUrl}/api/v1/vehicle/getByIds`, { idArray: user.vehicle.map(vehicle => vehicle.vehicleRef) }, {
      headers: {
        Authorization: `Bearer ${token}`,
    }
    })
    const vehiclesResult = apiResponse.data.result
    const userDefaultVehicle = user.defaultVehicle || null
  
    let result = user.vehicle.map(vehicle => {
      let vehicleFound = vehiclesResult.find(x => x._id.toString() === vehicle?.vehicleRef?.toString())
  
      return {
        // @ts-ignore
        _id: vehicle._id,
        evRegNumber: vehicle.evRegNumber,
        icon: vehicleFound && vehicleFound.icon ? vehicleFound.icon : "",
        modelName: vehicleFound && vehicleFound.modelName ? vehicleFound.modelName : "",
        brand: vehicleFound && vehicleFound.brand ? vehicleFound.brand : "",
        compactable_port: vehicleFound && vehicleFound.compactable_port
        ? vehicleFound.compactable_port
        : [],
        defaultVehicle: vehicle.evRegNumber === userDefaultVehicle ? true : false,
      }
    })
  
    res.status(200).json({ status: true, message: 'Ok', result: result })
  }
  


  // Update a user by ID
exports.updateUserDefaultVehicle = async (req, res) => {
    const vehicleId = req.body.vehicleId
    // @ts-ignore
    if (!vehicleId) throw new createError(400, "vehicleId is required")
  
    const updatedUser = await USER.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          defaultVehicle: vehicleId
        }
      },
      { new: true }
    )
    if (!updatedUser) {
      res.status(404).json({ status: false, message: 'User not found' })
    } else {
      res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
    }
  }
  

  // add vehicle
exports.addVehicle = async (req, res) => {
    // @ts-ignore
    if (!req.body.vehicleId) throw new createError(404, `vehicleId is a required field`)
    // @ts-ignore
    else if (!req.body.evRegNumber) throw new createError(404, `evRegNumber is a required field`)
  
    const vehicleId = req.body.vehicleId
    const evRegNumber = req.body.evRegNumber
  
    const user = await USER.findById(req.params.userId, 'vehicle')
    if (!user) return res.status(404).json({ status: false, message: 'User not found' })
  
    let evRegNumberFound = user.vehicle ? user.vehicle.find(x => x.evRegNumber === evRegNumber) : null
    // @ts-ignore
    if (evRegNumberFound) throw new createError(404, `duplicate evRegNumber found`)
  
    const updatedUser = await USER.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { vehicle: { evRegNumber: evRegNumber, vehicleRef: vehicleId } } },
      { new: true }
    )
    if (!updatedUser) {
      res.status(404).json({ status: false, message: 'User not found' })
    } else {
      res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
    }
  }
  
  // remove vehicle
  exports.removeVehicle = async (req, res) => {
    // @ts-ignore
    if (!req.body.evRegNumber) throw new createError(404, `evRegNumber is a required field`)
  
    const evRegNumber = req.body.evRegNumber
  
    const user = await USER.findById(req.params.userId, 'vehicle')
    // @ts-ignore
    const vehicleArray = user.vehicle || []
    const indexToRemove = vehicleArray.findIndex(x => x.evRegNumber === evRegNumber);
    // @ts-ignore
    if (indexToRemove === -1) throw new createError(404, `evRegNumber no not found`)
  
    vehicleArray.splice(indexToRemove, 1);
  
  
    const updatedUser = await USER.findByIdAndUpdate(
      req.params.userId,
      { $set: { vehicle: vehicleArray } },
      { new: true }
    )
    if (!updatedUser) {
      res.status(404).json({ status: false, message: 'User not found' })
    } else {
      res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
    }
  }
  