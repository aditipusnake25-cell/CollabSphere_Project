import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const registerUser = async (req, res) => {
    const { name, email, password } = req.body
    try {
        if (typeof name != "string" || typeof email != "string" || typeof password != "string") {
            return res.status(400).json({
                message: "Please enter valid information"
            })
        }
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required!"
            })
        }
        const normalEmail = email.trim().toLowerCase()
        const existEmail = await User.findOne({ email: normalEmail })
        if (existEmail) {
            return res.status(409).json({
                message: "Email already exists!"
            })
        }
        const salt = 12
        const hashPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            name: name.trim(),
            email: normalEmail,
            password: hashPassword
        })

        return res.status(200).json({
            message: "User registered successfully!",
            user: {
                name: user.name,
                email: user.email,
                Id: user._id
            }
        })
    } catch (error) {
        console.log("registration error: ", error.message);
        return res.status(500).json({
            message: error.message || "Failed to register!"
        })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        if (typeof email != "string" || typeof password != "string") {
            return res.status(400).json(
                {
                    message: "Enter valid information!"
                }
            )
        }
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email or password!"
            })
        }
        const normalEmail = email.trim().toLowerCase()
        const user = await User.findOne({ email: normalEmail })
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(404).json({
                message: "User not found!"
            })
        }
        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" })

        return res.status(200).json({
            message: "Login successfull!",
            Token: token
        })
    } catch (error) {
        console.log("Login error: ", error.message);
        return res.status(500).json({
            message: "Login failed!"
        })
    }
}

export {registerUser , loginUser}