import * as Auth from './Auth.js';
import * as User from './User.js';
import * as Interaction from './Interaction.js';
import * as Search from './Search.js';

const routes = (app, users) => {
console.log(Auth);
console.log(User);
console.log(Interaction);

// User authentification  ==========
app.post('/api/signup', Auth.signup);
app.post('/api/signin', Auth.signin);
app.post('/api/confirm', Auth.emailConfirm);

// Logged part  ====================
app.use(Auth.isLogged);
app.get('/api/whoami', Auth.whoami);

// Password  ============
app.post('/api/update_password', Auth.updatePassword);
app.get('/api/forgot_password', Auth.forgotPassword);

// User Datas  ==========
app.get('/api/profile/:login', User.getInfo); //block report and like also
app.put('/api/profile/:login', User.updateInfo);
// app.delete('/api/profile/:login', User.deleteProfile);
// app.get('/api/profile/:login/notifications', User.notifications);

// Images  ==============
app.get('/api/profile/:login/pictures/:id', User.getPicture);
app.post('/api/profile/:login/pictures', User.postPicture);
// app.delete('/api/profile/:login/pictures/:id', User.deletePicture);

// Likes  ===============
app.get('/api/:current/likes/:target', Interaction.getInterest);
app.put('/api/:current/likes/:target', Interaction.updateInterest(users));

// Report and block  ====
app.put('/api/:current/reports/:target', Interaction.reportUser, Interaction.updateBlock);
// app.get('/api/:current/blocks', Interaction.getBlocks);
app.put('/api/:current/blocks/:target', Interaction.updateBlock);

// search  ===============
app.get('/api/search', Search.advancedSearch);

// Suggestion  ===========
// app.get('/api/suggestions', suggestion);

}

export default routes;
