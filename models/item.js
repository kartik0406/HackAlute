var mongoose    =require("mongoose");
var itemSchema = new mongoose.Schema({
  
    title:String,
    description:String,
    swag:String,
    credits:Number,
    alutoze:Number,
    img:{image:Buffer,contentType:String,path:String}
});

  module.exports  =mongoose.model("item",itemSchema);