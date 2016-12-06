var mongoose = require('mongoose');

var TakenSchema = new mongoose.Schema({
  title : String,
  link : String,
  description : String
});

mongoose.model('Taken', TakenSchema);
