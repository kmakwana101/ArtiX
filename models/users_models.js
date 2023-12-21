let mongoose = require("mongoose")
let passportLocalMongoose  = require("passport-local-mongoose")
let Schema = mongoose.Schema

let UserSchema = new Schema({
    username :{
        type : String,
        required : true,
    },
    isAdmin : {
        type : Boolean,
        default : false
    }
})

UserSchema.plugin(passportLocalMongoose)

let USER = mongoose.model("usermodel1",UserSchema)

module.exports =  USER

