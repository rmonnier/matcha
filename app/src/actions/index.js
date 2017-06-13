import axios from 'axios';
import callApi from '../callApi.js';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const INIT_NOTIFICATIONS_NUMBER = 'INIT_NOTIFICATIONS_NUMBER';

const requestLogin = creds => ({
  type: LOGIN_REQUEST,
  isFetching: true,
  isAuthenticated: false,
  creds,
});

const receiveLogin = id_token => ({
  type: LOGIN_SUCCESS,
  isFetching: false,
  isAuthenticated: true,
  id_token,
});

const loginError = message => ({
  type: LOGIN_FAILURE,
  isFetching: false,
  isAuthenticated: false,
  message,
});

const requestLogout = () => ({
  type: LOGOUT_REQUEST,
  isFetching: true,
  isAuthenticated: true,
});

const receiveLogout = () => ({
  type: LOGOUT_SUCCESS,
  isFetching: false,
  isAuthenticated: false,
});

const receiveNotification = (message, level) => ({
  type: ADD_NOTIFICATION,
  message,
  level,
});

const unreadNotificationsNumber = number => ({
  type: INIT_NOTIFICATIONS_NUMBER,
  number,
});

const initNotificationsNumber = () => (dispatch) => {
  const url = '/unreadnotifications';
  callApi(url, 'GET')
  .then((json) => {
    const { error, count } = json.data;
    if (!error) {
      dispatch(unreadNotificationsNumber(parseInt(count, 10)));
    }
  });
};

// function logoutError(message) {
//   return {
//     type: LOGOUT_FAILURE,
//     isFetching: false,
//     isAuthenticated: true,
//     message
//   }
// }


// login action function, calls the API to get a token
const loginUser = creds => (dispatch) => {
  dispatch(requestLogin(creds));

  return axios.post('/api/signin', creds)
  .then(({ data: { error, token } }) => {
    if (!error) {
      // if login successful, set token in local storage
      localStorage.setItem('x-access-token', token);
      localStorage.setItem('login', creds.login);
      dispatch(receiveLogin(token));
    } else {
      dispatch(loginError(error));
    }
  })
  .catch(err => console.log('Error: ', err));
};

// logout action function, remove local storage
const logoutUser = () => (dispatch) => {
  dispatch(requestLogout());
  localStorage.removeItem('x-access-token');
  dispatch(receiveLogout());
};

export {
  logoutUser,
  loginUser,
  initNotificationsNumber,
  unreadNotificationsNumber,
  receiveNotification,
};
