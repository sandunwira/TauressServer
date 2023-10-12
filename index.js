const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database('data.db'); // Connect To The Database

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve Static Files
app.use(express.static('public'));


// Register Page
app.get('/register', (req, res) => {
	// HTML For Register Page
	let registerHtml = '<html>';
	registerHtml += '<head>';
	registerHtml += '<title>Register</title>';
	registerHtml += '<link rel="stylesheet" type="text/css" href="styles.css">';
	registerHtml += '<style>input { width: 100%; padding: 12px 20px; margin: 8px 0; box-sizing: border-box; }</style>';
	registerHtml += '</head>';
	registerHtml += '<body>';
	registerHtml += '<h1>Register</h1>';
	registerHtml += '<form action="/submit" method="post">';
	registerHtml += '<input type="text" name="username" placeholder="Username" required>';
	registerHtml += '<input type="email" name="email" placeholder="Email" required>';
	registerHtml += '<input type="password" name="password" placeholder="Password" required>';
	registerHtml += '<input type="submit" value="Register">';
	registerHtml += '</form>';
	registerHtml += '</body>';
	registerHtml += '</html>';

	res.send(registerHtml);
});

// Handle Register Form Submissions
app.post('/submit', (req, res) => {
	const { username, email, password } = req.body;
	// Save Timestamp To A Variable
	const timestamp = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear() + ' ' + new Date().toTimeString().slice(0, 5);

	// Save Form Data To The Database
	db.run('INSERT INTO userAccounts (timestamp, username, email, password) VALUES (?, ?, ?, ?)', [timestamp, username, email, password], (err) => {
		if (err) {
			console.error('Error Saving Data To Database:', err.message);
			res.status(500).send('Error Saving Data To Database :(');
			return;
		}

		console.log('Data Saved To Database :)');

		// HTML To Display Thanks & Submitted Data To User
		let submitHtml = '<html>';
		submitHtml += '<head>';
		submitHtml += '<title>Thank You</title>';
		submitHtml += '<link rel="stylesheet" type="text/css" href="styles.css">';
		submitHtml += '<style>button { color: white; background: #85008e; padding: 8px 16px; margin: 30px 0 0 0; width: auto; font-size: 20px; }</style>';
		submitHtml += '</head>';
		submitHtml += '<body>';
		submitHtml += '<h1>Thank You!</h1>';
		submitHtml += '<br>';
		submitHtml += '<h1>Here Is Your Submitted Form Data:</h1>';
		submitHtml += `<p>Username: ${username}</p>`;
		submitHtml += `<p>Email: ${email}</p>`;
		submitHtml += `<p>Password: ${password}</p>`;
		submitHtml += `<button onclick="window.location.href='./login'">Home</button>`;
		submitHtml += '</body>';
		submitHtml += '</html>';

		res.send(submitHtml);
	});
});


// Login Page
app.get('/login', (req, res) => {
	// HTML For Login Page
	let loginHtml = '<html>';
	loginHtml += '<head>';
	loginHtml += '<title>Login</title>';
	loginHtml += '<link rel="stylesheet" type="text/css" href="styles.css">';
	loginHtml += '<style>input { width: 100%; padding: 12px 20px; margin: 8px 0; box-sizing: border-box; }</style>';
	loginHtml += '</head>';
	loginHtml += '<body>';
	loginHtml += '<h1>Login</h1>';
	loginHtml += '<form action="/login" method="post">';
	loginHtml += '<input type="text" id="username" name="username" placeholder="Username" required>';
	loginHtml += '<input type="password" id="password" name="password" placeholder="Password" required>';
	loginHtml += '<input type="submit" value="Login">';
	loginHtml += '</form>';
	loginHtml += '</body>';
	loginHtml += '</html>';

	res.send(loginHtml);
});

// Handle Login Form Submissions
app.post('/login', (req, res) => {
	const { username, password } = req.body;

	db.all('SELECT * FROM userAccounts WHERE username = ? AND password = ?', [username, password], (err, rows) => {
		if (err) {
			console.error('Error Retrieving Data From Database:', err.message);
			res.status(500).send('Error Retrieving Data From Database :(');
			return;
		}

		if (rows.length === 0) {
			res.status(401).send('Incorrect Username Or Password :(');
			return;
		}

		if (username === 'admin' && password === 'admin') {
			res.redirect('/admin');
			return;
		} else {
			res.redirect('/');
			return;
		}
	});
});


// Display Form Data From The Database
app.get('/admin', (req, res) => {
	// Retrieve Data From The Database
	db.all('SELECT * FROM userAccounts', (err, rows) => {
		if (err) {
			console.error('Error Retrieving Data From Database:', err.message);
			res.status(500).send('Error Retrieving Data From Database :(');
			return;
		}

		// HTML Table To Display Data
		let viewHtml = '<html>';
		viewHtml += '<head>';
		viewHtml += '<title>Form Data</title>';
		viewHtml += '<link rel="stylesheet" type="text/css" href="styles.css">';
		viewHtml += '</head>';
		viewHtml += '<body>';
		viewHtml += '<h1>Form Data</h1>';
		viewHtml += '<table border="1">';
		viewHtml += '<tr>';
		viewHtml += '<th>ID</th>';
		viewHtml += '<th>Timestamp</th>';
		viewHtml += '<th>Username</th>';
		viewHtml += '<th>Email</th>';
		viewHtml += '<th>Password</th>';
		viewHtml += '<th>Actions</th>';
		viewHtml += '</tr>';

		// Populate The Table
		rows.forEach((row) => {
			viewHtml += `<tr>`;
			viewHtml += `<td>${row.id}</td>`;
			viewHtml += `<td>${row.timestamp}</td>`;
			viewHtml += `<td>${row.username}</td>`;
			viewHtml += `<td>${row.email}</td>`;
			viewHtml += `<td>${row.password}</td>`;
			viewHtml += `<td><a href="/delete/${row.id}" class="deleteBtn">Delete</a></td>`;
			viewHtml += `</tr>`;
		});

		viewHtml += '</table>';
		viewHtml += '<br>';
		viewHtml += '<a href="/logout">Logout</a>';
		viewHtml += '</body>';
		viewHtml += '</html>';

		res.send(viewHtml);
	});
});


// Logout Page
app.get('/logout', (req, res) => {
	// HTML For Logout Page
	let logoutHtml = '<html>';
	logoutHtml += '<head>';
	logoutHtml += '<title>Logout</title>';
	logoutHtml += '<link rel="stylesheet" type="text/css" href="styles.css">';
	logoutHtml += '</head>';
	logoutHtml += '<body>';
	logoutHtml += '<h1>Logout</h1>';
	logoutHtml += '<p>Logged out successfully!</p>';
	logoutHtml += '<a href="/login">Login</a>';
	logoutHtml += '</body>';
	logoutHtml += '</html>';

	res.send(logoutHtml);
});


// Delete Data From The Database
app.get('/delete/:id', (req, res) => {
	const id = req.params.id;

	db.run('DELETE FROM userAccounts WHERE id = ?', id, (err) => {
		if (err) {
			console.error('Error Deleting Data From Database:', err.message);
			res.status(500).send('Error Deleting Data From Database :(');
			return;
		}

		console.log('Data Deleted From Database :)');

		res.redirect('/admin');
	});
});

// Start The Server
app.listen(port, () => {
	console.log(`Server Is Running On Port: http://localhost:${port}`);
});