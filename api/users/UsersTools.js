const bcrypt = require('bcrypt-nodejs');
const geolib = require('geolib');

// Authentication and activation tools -----------------------------------------
const generateHash = password => (
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
);

const validPassword = (password, hashedPassword) => (
  bcrypt.compareSync(password, hashedPassword)
);

const randomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// compute data to send to users
const getPopularity = (visits, likes) => ((likes * 50) / (visits + 1));

const getDistance = (userA, userB) => {
  if (!userA.location || !userB.location ||
      !userA.location.latitude || !userA.location.longitude ||
      !userB.location.latitude || !userB.location.longitude) {
    return null;
  }
  const distance = geolib.getDistance({
    latitude: userA.location.latitude,
    longitude: userA.location.longitude,
  }, {
    latitude: userB.location.latitude,
    longitude: userB.location.longitude,
  });
  const kmDist = distance / 1000;
  return (Math.floor(kmDist));
};

const getTagsInCommon = (userA, userB) => {
  const result = [];
  const { tags } = userA;
  if (tags && tags.length && userB.tags && userB.tags.length) {
    for (let i = 0, len = tags.length; i < len; i += 1) {
      if (userB.tags.indexOf(tags[i]) !== -1) result.push(tags[i]);
    }
  }
  return result;
};

const getAge = (birthDate) => {
  if (!birthDate) return null;
  if (!(birthDate instanceof Date)) {
    birthDate = new Date(birthDate);
  }

  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getFullYear() - 1970);
};

const getBirthDate = (age) => {
  if (!age) return null;

  const date = new Date();
  const currentYear = date.getFullYear();
  date.setFullYear(currentYear - age);

  return (date);
};

const addUsefullData = (users, currentUser) => (
  users.map((user) => {
    user.age = getAge(user.birthDate);
    user.popularity = getPopularity(user.visits, user.interestCounter);
    user.tagsInCommon = getTagsInCommon(user, currentUser).length;
    user.distance = getDistance(user, currentUser);
    return (user)
  })
);

const addAge = users => (
  users.map(user => ({ ...user, age: getAge(user.birthDate) }))
);

// New profile -----------------------------------------------------------------
const create = (gender, email, firstname, lastname, login, password, activationString, location) => {
  const emptyArray = [];
  const hashedPassword = generateHash(password);
  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);
  const loc = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  return ({
    login: login.toLowerCase(),
    password: hashedPassword,
    email,
    firstname: firstname.toLowerCase(),
    lastname: lastname.toLowerCase(),
    pictures: emptyArray,
    profilePicture: -1,
    interestedIn: emptyArray,
    interestedPeople: emptyArray,
    blocked: emptyArray,
    blockedBy: emptyArray,
    interestCounter: 0,
    visits: 0,
    visitedBy: emptyArray,
    tags: emptyArray,
    notifications: emptyArray,
    matches: emptyArray,
    gender,
    lookingFor: ['male', 'female'],
    active: false,
    activationString,
    lastConnection: new Date(),
    birthDate: new Date(1990),
    loc,
  });
};

// Infos to send --------------------------------------------------------------

// public profile
const getLookingFor = (lookingFor) => {
  let output;
  if (lookingFor.length === 2) {
    output = 'both';
  } else if (lookingFor.indexOf('male') !== -1) {
    output = 'male';
  } else if (lookingFor.indexOf('female') !== -1) {
    output = 'female';
  } else {
    output = '';
  }
  return output;
};

const filterInfos = (user) => {
  const { login,
    firstname,
    lastname,
    age,
    gender,
    lookingFor,
    about,
    tags,
    tagsInCommon,
    pictures,
    profilePicture,
    popularity,
    distance,
    lastConnection,
    compatibility,
  } = user;
  return {
    login,
    firstname,
    lastname,
    age,
    gender,
    lookingFor,
    about,
    tags,
    tagsInCommon,
    pictures,
    profilePicture,
    popularity,
    distance,
    lastConnection,
    compatibility,
  };
};

const getInfos = (user, currentUser) => {
  user.age = getAge(user.birthDate);
  user.popularity = getPopularity(user.visits, user.interestCounter);
  user.distance = getDistance(user, currentUser);
  user.lookingFor = getLookingFor(user.lookingFor);
  return filterInfos(user);
};

const filterData = users => (
  users.map(user => (
    filterInfos(user)
  ))
);

// private profile
const getPrivateInfos = (user) => {
  user.age = getAge(user.birthDate);
  user.popularity = getPopularity(user.visits, user.interestCounter);
  user.lookingFor = getLookingFor(user.lookingFor);
  return filterPrivateInfos(user);
};

const filterPrivateInfos = (user) => {
  const { login,
    firstname,
    lastname,
    email,
    birthDate,
    age,
    gender,
    lookingFor,
    about,
    tags,
    pictures,
    profilePicture,
    popularity,
    loc,
    lastConnection,
  } = user;
  return {
    login,
    firstname,
    lastname,
    email,
    age,
    birthDate,
    gender,
    lookingFor,
    about,
    tags,
    pictures,
    profilePicture,
    popularity,
    loc,
    lastConnection,
  };
};

module.exports = { getInfos,
  getPrivateInfos,
  create,
  randomString,
  getBirthDate,
  getAge,
  filterData,
  addUsefullData,
  addAge,
  validPassword,
  generateHash,
};
