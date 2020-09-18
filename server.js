/* External Modules */
const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/* Internal Modules */
const db = require('./models');
const controllers = require('./controllers');

/* Instantiated Modules */
const app = express();

/* Configuration */
const PORT = 4000;
app.set('view engine', 'ejs');

/* Middleware */
app.use(methodOverride('_method'));

app.use(express.static('public'));
//const path = require('path');
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

/* Routes */
// index view
app.get('/', (req,res) => {
    res.send('You have reached the homepage.');
});

// Category routes
app.use('/categories', controllers.category_control);

// Tool routes
app.use('/tools', controllers.tool_control);

/* Server Listener */
app.listen(PORT, () => {
    console.log('greetings your port is '+PORT);
});