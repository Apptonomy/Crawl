const mysql = require('mysql');
const util = require('util');
// allowing access to our environmental variables, in a .env file in root directory
require('dotenv').config({ path: '../.env' });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'crawl';

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

const query = util.promisify(connection.query).bind(connection);

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Database connected!');
  }
});

// USER QUERIES
const getUser = (email) => {
  const mysqlQuery = 'SELECT * FROM User WHERE Email = ?;';
  return query(mysqlQuery, [email]);
};

const postUser = ({
  username, nameFirst, nameLast, phoneNumber, email, imageUrl, lat, lng,
}) => {
  if (!lat) {
    lat = 0.0;
  }
  if (!lng) {
    lng = 0.0;
  }
  const mysqlQuery = 'INSERT IGNORE INTO User VALUES(null, ?, ?, ?, ?, ?, ?, ?, ?);';
  return query(mysqlQuery, [username, nameFirst, nameLast, phoneNumber, email, imageUrl, lat, lng]);
};

const updateContact = (number, userId) => {
  const mysqlQuery = 'UPDATE User SET Phone_Number = ? WHERE Id = ?;';
  return query(mysqlQuery, [number, userId]);
};

const updateUserLoc = (location, idUser) => {
  const { lat, lng } = location;
  const mysqlQuery = 'UPDATE User SET Lat = ?, Lng = ? WHERE Id = ?;';
  return query(mysqlQuery, [lat, lng, idUser]);
};

const getCrawlsUsers = (idCrawl) => {
  const mysqlQuery = 'SELECT * FROM User_Crawl INNER JOIN User ON Id_Crawl = ?;';
  return query(mysqlQuery, [idCrawl]);
};

// CRAWL QUERIES
const getCrawl = (idCreator) => {
  const mysqlQuery = 'SELECT * FROM Crawl WHERE Id_Creator = ?;';
  return query(mysqlQuery, [idCreator]);
};

const getUsersCrawls = (idUser) => {
  const mysqlQuery = 'SELECT * FROM User_Crawl INNER JOIN Crawl ON Crawl.Id = User_Crawl.Id_Crawl && User_Crawl.Id_User = ?;';
  return query(mysqlQuery, [
    idUser,
  ]);
};

const getOneCrawl = (id) => {
  const mysqlQuery = 'SELECT * FROM Crawl WHERE Id = ?;';
  return query(mysqlQuery, [id]);
};

const joinCrawl = (idUser, idCrawl) => {
  const mysqlQuery = 'INSERT IGNORE INTO User_Crawl VALUES(null, ?, ?);';
  return query(mysqlQuery, [idUser, idCrawl]);
};

const getJoinedCrawls = (idUser) => {
  const mysqlQuery = 'SELECT * FROM User_Crawl WHERE Id_User = ?;';
  return query(mysqlQuery, [idUser]);
};

const postCrawl = ({
  idCreator, title, crawlDate, crawlTime,
}) => {
  const mysqlQuery = 'INSERT INTO Crawl VALUES(null, ?, ?, ?, ?);';
  return query(mysqlQuery, [
    idCreator,
    title,
    crawlDate,
    crawlTime,
  ]);
};

// LOCATION QUERIES
const getLocation = (name) => {
  const mysqlQuery = 'SELECT * FROM Location WHERE Name = ?;';
  return query(mysqlQuery, [
    name,
  ]);
};


const getLocsInCrawl = (idCrawl) => {
  const mysqlQuery = 'SELECT * FROM Location_Crawl INNER JOIN Location ON Location.Id = Location_Crawl.Id_Location && Location_Crawl.Id_Crawl = ?;';
  return query(mysqlQuery, [
    idCrawl,
  ]);
};

const postLocations = ({
  address, lat, lng, name,
}) => {
  const mysqlQuery = 'INSERT IGNORE INTO Location VALUES(null, ?, ?, ?, ?);';
  return query(mysqlQuery, [
    address,
    lat,
    lng,
    name,
  ]);
};

// JOIN QUERIES
const locationCrawl = (idLocation, idCrawl, order) => {
  const mysqlQuery = 'INSERT IGNORE INTO Location_Crawl VALUES(null, ?, ?, ?);';
  return query(mysqlQuery, [
    idLocation,
    idCrawl,
    order,
  ]);
};

const userCrawl = (idUser, idCrawl) => {
  const mysqlQuery = 'INSERT IGNORE INTO User_Crawl VALUES(null, ?, ?);';
  return query(mysqlQuery, [
    idUser,
    idCrawl,
  ]);
};

module.exports = {
  // USERS
  getUser,
  postUser,
  updateContact,
  updateUserLoc,
  getCrawlsUsers,
  // CRAWLS
  getCrawl,
  getUsersCrawls,
  getOneCrawl,
  postCrawl,
  joinCrawl,
  getJoinedCrawls,
  // LOCATIONS
  getLocation,
  postLocations,
  getLocsInCrawl,
  // JOIN
  locationCrawl,
  userCrawl,
};
