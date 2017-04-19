// app/routes.js
import User     from './models/user'
import fs 			from 'fs'
import uuid			from 'uuid'
import path			from 'path'

module.exports = (app, express, jwt) => {

app.get('/api/profile/:login', (req, res) => {
	User.findOne({ 'login' :  req.params.login }, (err, user) => {
		if (err) throw err;
		if (!user) return res.status(404).send("User inexistant.");
		const {login, firstname, lastname, popularity, pictures, about, tags} = user;
		const age = user.getAge();
		const data = {login, firstname, lastname, age, popularity, pictures, about, tags};
		console.log(data);
		res.json(data);
	})
})

app.get('/api/pictures/:login/:id', (req, res, next) => {
	User.findOne({ 'login' :  req.params.login }, (err, user) => {
		if (err) throw err;
		res.sendFile(path.resolve(__dirname, '../images/' + req.params.login + '/' + req.params.id), function (err) {
			if (err) {
				next(err);
			} else {
				console.log('Sent:', req.params.id);
			}
		})
	})
})


// FILE UPLOAD =====================


// // INFO UPDATE =====================
// app.post('/update-info', (req, res) => {
//
// })
//

const apiRoutes = express.Router()

apiRoutes.post('/signup', (req, res, next) => {
	const {login, email, password, confirmpassword} = req.body
	User.findOne({ 'login':  login }, function(err, user) {
		if (err) throw err
		if (user) return res.json({ success: false, message: 'That login is already taken.' })

		if (password != confirmpassword)  return res.json({ success: false, message: 'Passwords are different.' })
		const newUser = new User()
		newUser.email = email
		newUser.login = login
		newUser.password = newUser.generateHash(password)
		newUser.save((err) => {
			if (err) throw err
			return res.json({ success: true, message: 'Account successfully created.' }).end()
		})
	})
})

apiRoutes.post('/signin', (req, res, next) => {
	const {login, password} = req.body
	User.findOne({ 'login':  login }, (err, user) => {
		if (err) throw err
		if (!user) return res.json({ success: false, message: 'Authentication failed. User not found.' })
		if (!user.validPassword(password)) return res.json({ success: false, message: 'Authentication failed. Wrong password.' })
		const token = jwt.sign({currentUser: user.login}, app.get('superSecret'), { expiresIn: 3600 * 24 })
		return res.json({ success: true, message: 'Token delivered.', token: token })
	})
})

apiRoutes.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, app.get('superSecret'), (err, decoded) => {
      if (err) return res.json({ success: false, message: 'Failed to authenticate token.' })
      else
			{
				req.decoded = decoded
				next()
			}
    })
  }
	else return res.status(403).send({success: false, message: 'No token provided.'})
})

apiRoutes.get('/whoami', (req, res) => {
	const {currentUser} = req.decoded
	console.log(req.decoded);
	return res.json({success: true, message: 'Authenticated as ' + currentUser})
})

apiRoutes.post('/profile/:login', (req, res) => {
	const {currentUser} = req.decoded
	const	{login} =req.params
	if (login != currentUser) return res.json({success: false, message: 'No rights for update this profile.'})

	const request = req.body
 	const whitelist = ['firstname', 'lastname', 'email', 'birthDate', 'gender', 'interestedIn', 'about',
	 										'tags', 'profilePictureId', 'localisation']
	const update = {};

	for (let ix in whitelist)
	{
		const field = whitelist[ix];
		if (request.hasOwnProperty(field)) update[field] = request[field]
	}
	console.log(update);
	User.update({ login: currentUser }, update, (err, raw) => {
  	if (err) throw err
  	// console.log('The raw response from Mongo was ', raw)
		res.json({success: true, message: 'Profile successfully updated.'})
	})
})

apiRoutes.post('/upload', (req, res) => {
	if (!req.files || !req.files.image)
	return res.status(400).json({success: false, message: 'No images were uploaded.'})

	const {image} = req.files
	const {login} = req.decoded

	User.findOne({login:  login }, (err, user) => {
		if (err) throw err
		console.log(user.pictures)
		if (user.pictures.length >= 5)
		return res.status(400).json({success: false, message: 'Too many images.'})

		const userPath = './images/' + login

		fs.access(userPath, fs.F_OK, (err) => {
			if (err)
			{
				fs.mkdir(userPath, (err) => {
					if (err) throw err
					console.log("userFolder created !")
				})
			}
		})

		const imageId = uuid.v4()
		user.pictures = [...user.pictures, imageId]
		user.save((err) => { if (err) console.log(err) })

		const imagePath = userPath + '/' + imageId;
		image.mv(imagePath, (err) => {
			if (err)
			return res.status(500).json({success: false, message: err})
			res.json({success: true, message: 'File uploaded!'})
		});
	})
})

app.use('/api', apiRoutes);
}


// route middleware to make sure a user is logged in
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated())
	return next();
	res.redirect('/');
}
