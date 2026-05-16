import User from "../models/User.js"

export const getProfile = async (req, res) => {
    try {
        const user =
            await User.findById(
                req.params.id
            ).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        res.json(user)
    }

    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { name, branch } = req.body
        const user =
            await User.findById(
                req.params.id
            )
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        user.name = name || user.name
        user.branch = branch || user.branch

        await user.save()

        res.json({
            message: "Profile Updated Successfully",
            user
        })
    }

    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}