var mongoose    =require("mongoose");
var creditSchema = new mongoose.Schema({
  
    id:String,
    title:String,
    name:String,
   link:String,
   description:String,
   userId:String,
   credits:Number,
   owner:{
    id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    username:String,
  
},
flag:Number
});

  module.exports  =mongoose.model("credit",creditSchema);