require('dotenv').config();
require('./config/database');
require('./config/passport');
const express = require('express');
const app = express();
const cors = require('cors');
const User = require('./models/user.model');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const saltRounds = 10;

app.set(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'))
app.set('view engine', 'ejs');

// session create
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions'
    })
}));

app.use(passport.initialize());
app.use(passport.session());

// base route
app.get('/', (req, res) => {
    res.render('home');
})

// register route
app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username: username});
        if (user) return res.status(401).send({message: 'User already exists'});
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            const newUser = new User({
                username: username,
                password: hash,
            });
            await newUser.save();
            res.redirect('/login');
        })
    } catch (error) {
        res.status(500).send(error);
    }
});

// login route
const checkLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return res.redirect('/profile');
    }
    next();
}

app.get('/login', checkLoggedIn, (req, res) => {
    res.render('login');
})

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/profile' }));

// logout route
app.get('/logout', (req, res) => {
    try {
        req.logout((err) => {
            if(err) return next(err);
        })
        res.redirect("/");
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// profile route
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login');
}

app.get('/profile', checkAuthenticated, (req, res) => {
    res.render('profile', {username: req.user.username});
})

// Route not found
app.use((req, res, next) => {
    res.status(404).send('route not found');
})

// Server error
app.use((err, req, res, next) => {
    res.status(500).send(err);
})

module.exports = app;