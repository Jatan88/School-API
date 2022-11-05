const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    fathername: {
        type: String,
    },
    semester: {
        type: Number,
    },
    grades: {
        type: String,
    },
    studentId: {
        type: Number,
    },
    teacherId: {
        type: Number,
    },
})

module.exports = mongoose.model('report', reportSchema)