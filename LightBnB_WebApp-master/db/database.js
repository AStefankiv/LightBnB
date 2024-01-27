const { query } = require("express");
const properties = require("./json/properties.json");
const users = require("./json/users.json");
const pool = require("../db/index");


/// Users
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, [user.name, user.email, user.password])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};


/// Reservations
/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
    .query(`SELECT * FROM reservations JOIN properties ON reservations.property_id = properties.id WHERE guest_id = $1 LIMIT $2;`, [guest_id, limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};


/// Properties
/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += ` AND owner_id = $${queryParams.length}`;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += ` AND cost_per_night >= $${queryParams.length}`;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += ` AND cost_per_night <= $${queryParams.length}`;
  }
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += ` AND rating >= $${queryParams.length}`;
  }
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  console.log(queryString, queryParams);
  return pool.query(queryString, queryParams).then((res) => res.rows);
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryParams = [];
  let queryString = `
  INSERT INTO properties (
    owner_id, 
    title, 
    description, 
    thumbnail_photo_url, 
    cover_photo_url, 
    cost_per_night, 
    street, 
    city, 
    province, 
    post_code, 
    country, 
    parking_spaces, 
    number_of_bathrooms, 
    number_of_bedrooms)
    VALUES (
  `;
  if (property.owner_id) {
    queryParams.push(property.owner_id);
    queryString += `$${queryParams.length}, `;
  }
  if (property.title) {
    queryParams.push(property.title);
    queryString += `$${queryParams.length}, `;
  }
  if (property.description) {
    queryParams.push(property.description);
    queryString += `$${queryParams.length}, `;
  }
  if (property.thumbnail_photo_url) {
    queryParams.push(property.thumbnail_photo_url);
    queryString += `$${queryParams.length}, `;
  }
  if (property.cover_photo_url) {
    queryParams.push(property.cover_photo_url);
    queryString += `$${queryParams.length}, `;
  }
  if (property.cost_per_night) {
    queryParams.push(property.cost_per_night);
    queryString += `$${queryParams.length}, `;
  }
  if (property.street) {
    queryParams.push(property.street);
    queryString += `$${queryParams.length}, `;
  }
  if (property.city) {
    queryParams.push(property.city);
    queryString += `$${queryParams.length}, `;
  }
  if (property.province) {
    queryParams.push(property.province);
    queryString += `$${queryParams.length}, `;
  }
  if (property.post_code) {
    queryParams.push(property.post_code);
    queryString += `$${queryParams.length}, `;
  }
  if (property.country) {
    queryParams.push(property.country);
    queryString += `$${queryParams.length}, `;
  }
  if (property.parking_spaces) {
    queryParams.push(property.parking_spaces);
    queryString += `$${queryParams.length}, `;
  }
  if (property.number_of_bathrooms) {
    queryParams.push(property.number_of_bathrooms);
    queryString += `$${queryParams.length}, `;
  }
  if (property.number_of_bedrooms) {
    queryParams.push(property.number_of_bedrooms);
    queryString += `$${queryParams.length}`;
  }
  queryString += `) RETURNING *;`;
  console.log(queryString, queryParams);
  return pool.query(queryString, queryParams).then((res) => res.rows);
};


module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};