const loadSecrets = require('./src/config/env.config.js')
require('dotenv').config()

//test
if (process.env.ENVIRONMENT === 'production') {
  loadSecrets()
    .then(() => {
      const app = require('./src/app.js')
      const connectDB = require('./src/db')
      const PORT = process.env.VEH_PORT || 5689

      // Connect to MongoDB
      connectDB()
        .then(() => {
          // Database connected,
          app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
          })
        })
        .catch((err) => {
          console.error('Database connection failed', err)
        })
    })
    .catch((err) => {
      console.error('Failed to load secrets', err)
    })
} else {
  const app = require('./src/app.js')
  const connectDB = require('./src/db')
  const PORT = process.env.VEH_PORT || 5689

  // Connect to MongoDB
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error('Database connection failed', err)
    })
}
