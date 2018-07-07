const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items');
menusRouter.use('/:menuId/menu-items', menuItemsRouter);
//api/menus

//GET
//Returns a 200 response containing all saved menus on the menus
//property of the response body

//POST
//Creates a new menu with the information from the menu property of the
//request body and saves it to the database. Returns a 201 response with
//the newly-created menu on the menu property of the response body
//If any required fields are missing, returns a 400 response


//api/menus/:menuId
//GET
//Returns a 200 response containing the menu with the supplied menu
//ID on the menu property of the response body
//If a menu with the supplied menu ID doesn't exist, return 404 response

//PUT
//Updates the menu with the specified menu ID using the information
//from the menu property of the request body and saves it to the
//database. Returns a 200 response with the updated menu on the menu
//property of the response body
//If any required fields are missing, returns a 400 response
//If a menu with the supplied menu ID doesn't exist, return 404 response

//DELETE
//Deletes the menu with the supplied menu ID from the database if that
//menu has no related menu items. Returns a 204 response
//If the menu with the supplied menu ID has related menu items,
//returns a 400 response
//If a menu with the supplied menu ID doesn't exist, return 404 response


module.exports = menusRouter;
