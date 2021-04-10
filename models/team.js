var mongoose    =require("mongoose");
var teamSchema = new mongoose.Schema({
  
    
      
        name:String
      
    

});

  module.exports  =mongoose.model("team",teamSchema);