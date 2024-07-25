import express from 'express'
import AuthController from '../Controllers/AuthController.js'
import FormController from '../Controllers/FormController.js'
import jwtAuth from '../middlewares/jwtAuth.js'
const router = express.Router() 
router.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    })
})
 
router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh-token', jwtAuth(), AuthController.refreshToken)
router.post('/forms', jwtAuth(), FormController.store)

export default router