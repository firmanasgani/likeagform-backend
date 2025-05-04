import mongoose from "mongoose"
import Form from "../models/Form.js"

class FormController {
    async store(req, res) {
        try {
            const form = await Form.create({
                userId: req.jwt.id,
                title: req.body.title,
                description:null,
                questions: null,
                public: false
            })

            if(!form) {
                throw {
                    code: 500,
                    message: "FORM_CREATED_FAILED"
                }
            }

            return res.status(200).json({
                status: true,
                message: "FORM_CREATED_SUCCESS",
                data: form
            })
        }catch(error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            })
        }
    }

    async show(req, res) {
        try {
            if(!req.params.id) {
                throw {
                    code: 400,
                    message: "FORM_ID_REQUIRED"
                }
            }
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw {
                    code: 400,
                    message: "FORM_ID_INVALID"
                }
            }

            const form = await Form.findOne({
                _id: req.params.id,
                userId: req.jwt.id
            })

            if(!form) {
                throw {
                    code: 404,
                    message: "FORM_NOT_FOUND"
                }
            }

            return res.status(200).json({
                status: true,
                message: "FORM_FOUND",
                data: form
            })


        }catch(error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            })
        }
    }
}

export default new FormController()