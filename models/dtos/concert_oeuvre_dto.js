
const mongoose=require("mongoose")




const concertOeuvreSchema=mongoose.Schema({
    concert:{
        type:Object,
        ref: 'Concert'
    },
  
    programme:[{
        type:Object,
        ref: 'oeuvres'
    }],

})
module.exports=mongoose.model("co",concertOeuvreSchema)