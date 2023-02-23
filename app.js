const express = require('express');
const HLTV = require('hltv-api').default;
const app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const port = process.env.PORT || 3000;

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css',express.static(__dirname +'/css'));
app.use('/js',express.static(__dirname +'/js'));
app.use('/audio',express.static(__dirname +'/audio'));
app.use('/images',express.static(__dirname +'/images'));
app.use('/webfonts',express.static(__dirname +'/webfonts'));
app.use('/ML', express.static(__dirname + '/ML'))
app.use('/views', express.static(__dirname + '/views'))
app.use('/public', express.static(__dirname + '/public'))

const saltRounds = 10;


app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, 'indexCSGO.html'));
})

app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, '/public/register.html'));
})

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
})

app.get('/teams', async (req, res) => {
    const teams = await HLTV.getTopTeams();
    res.json(teams);
});

mongoose.connect("mongodb://0.0.0.0:27017/webapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((e) => {
    console.log("Not connected");
});

const userSchema = new mongoose.Schema({
    fullName: {
      type: String,
      // required: true
    },
    username: {
      type: String,
      // required: true,
      unique: true
    },
    email: {
      type: String,
      // required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      // required: true
    },
    password: {
      type: Array,
      // required: true
    },
    gender : {
        type: String,
        enum: ['male', 'female']
    },
    joined: { 
        type: Date, 
        default: Date.now,
        required : false
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required : false
    }
  }, {
    versionKey: false
  });
  
  const User = mongoose.model('User', userSchema);

  // use body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// handle POST request to /register endpoint
app.post('/register', (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmPassword;
    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;

    if((password === cpassword) && (regex.test(password))) {
      // create new user object from request body
      const newUser = new User({
        fullName: req.body.fullName,
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        // password: [bcrypt.hashSync(password, 10), bcrypt.hashSync(cpassword, 10)],
        password : [password,cpassword],
        gender: req.body.gender
      });

  // save user object to database
  newUser.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error registering new user.');
    } else {
      res.redirect('/login');
    }
  });
    } 
      else {
        res.redirect('/register');
      }
  } catch(error) {
    res.status(400).send(error)
  }
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username, password : password }, (err, result) => {
    if (err) {
      console.error('Failed to find user', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (!result) {
      res.send('<script>alert("Invalid username or password.");window.location="/login";</script>');
      return;
    }

    // Check if the user is an admin
    if (result.isAdmin) {
      // Redirect to the admin page
      res.redirect('/admin');
    } else {
      // Redirect to the user page
      res.redirect('/success');
    }
  });
});

// handle GET request to /success endpoint
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// set view engine
app.set("view engine", "ejs")
// Read
app.get('/admin', (req, res) => {
  User.find((err, users) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving users');
    } else {
      res.render('admin', { users });
    }
  });
});

// Create
app.post('/admin/create', (req, res) => {
  const newUser = new User({
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password : [req.body.password, req.body.password],
    gender: req.body.gender
  });
  newUser.save((err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating user');
    } else {
      res.redirect('/admin');
    }
  });
});


// Delete
app.post('/admin/delete/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
    } else {
      res.redirect('/admin');
    }
  });
});

app.get('/admin/view/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
      res.render('view', { user });
    });
  });

// Update
app.post('/admin/update/:id', (req, res) => {
  const updateData = {
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password : [req.body.password, req.body.password],
    gender: req.body.gender
  };
  User.findByIdAndUpdate(req.params.id, updateData, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating user');
    } else {
      res.redirect('/admin');
    }
  });
});



app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'indexCSGO.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);