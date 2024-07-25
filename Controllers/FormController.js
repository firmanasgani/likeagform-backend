import mongoose from "mongoose";
import Form from "../models/Form"; 

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
}

export default new FormController()