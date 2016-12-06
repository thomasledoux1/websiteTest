var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var Taken = mongoose.model('Taken');
var User = mongoose.model('User');




var auth = jwt({secret : 'SECRET', userProperty:'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/taken', function(req, res, next){
  Taken.find(function(err, taken){
    if(err){return next(err);}
    res.json(taken);
  });
});

router.post('/taken',auth, function(req, res, next){
  var taak = new Taken(req.body);
  taak.author = req.payload.username;
  taak.save(function(err, taak){
    if(err) {return next(err);}
    res.json(taak);
  });
});

router.param('taak', function(req, res, next, id){
  var query = Taken.findById(id);
  query.exec(function(err, taak){
    if(err){return next(err);}
    if(!taak){return next(new Error('can not find post'));}

    req.taak = taak;
    return next();
  });
});

router.get('/taken/:taak', function(req, res){
  res.json(req.post);
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message : 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err) {return next(err);}

    if(user){
      return res.json({token : user.generateJWT()});
    }
    else{
      return res.status(401).json(info);
    }
  })(req, res, next);
});


module.exports = router;
