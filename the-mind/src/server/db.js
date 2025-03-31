import mongoose from "mongoose";

export const  connectDB = async () =>{
    await mongoose.connect('mongodb+srv://radubtw30:bestfoodever@notix.3epxx.mongodb.net/').then(()=>console.log("DB Connected"))
}