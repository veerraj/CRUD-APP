const path = require('path');
//use express module
const express = require('express');
var session = require('express-session');

//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const app = express();
 
//Create connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Cricket_db'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
//set public folder as static folder for static file
//app.use('/assets',express.static(__dirname + '/public'));
 
//route for homepage
/*app.get('/',(req, res) => {
  let sql = "SELECT * FROM cricket";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('player',{
      results: results
    });
  });
// });*/

app.get('/',(req, res) => {
  
  
  res.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/register.html',(req, res) => {
  
  
  res.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/register',(req, res) => {
  let data = {username: req.body.username,password:req.body.password,email: req.body.email};
  let sql = "INSERT INTO accounts SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    else
    req.session.loggedin = true;
    res.redirect('/player');
  });
});
 

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		conn.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/player');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/player', function(request, response) {
	if (request.session.loggedin) {
    let sql = "SELECT * FROM cricket";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
        response.render('player',{
        results: results
      });
    });
  }
  else
  {
    response.redirect('/auth')
  }
});
  
//route for insert data
app.post('/save',(req, res) => {
  let data = {name: req.body.name,resignation: req.body.resignation,team:req.body.team,score:req.body.score};
  let sql = "INSERT INTO cricket SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE cricket SET name='"+req.body.name+"', resignation='"+req.body.resignation+"',team='"+req.body.team+"',score='"+req.body.score+"' WHERE id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM cricket WHERE id="+req.body.id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});
app.post('/logout',(req, res) => {
  req.session.loggedout = true;
      res.redirect('/');
  
});
 
//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});