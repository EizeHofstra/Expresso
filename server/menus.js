const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items');


//api/menus
//Router param for menuId
menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);


//GET
//Returns a 200 response containing all saved menus on the menus
//property of the response body
menusRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Menu`;
  db.all(sql, (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});



//POST
//Creates a new menu with the information from the menu property of the
//request body and saves it to the database. Returns a 201 response with
//the newly-created menu on the menu property of the response body
//If any required fields are missing, returns a 400 response
menusRouter.post('/', (req, res, next) => {
  const newMenu = req.body.menu;
  if (!newMenu.title) {
    res.status(400).send();
  }
  const sql = `INSERT INTO Menu (title)
  VALUES ($title)`;
  const values = {$title: newMenu.title};
  db.run(sql, values, function (error) {
    if (error) {
      res.status(400).send();
    }
    db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
      (error, row) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({menu: row});
        }
      });
  });
});



//api/menus/:menuId
//GET
//Returns a 200 response containing the menu with the supplied menu
//ID on the menu property of the response body
//If a menu with the supplied menu ID doesn't exist, return 404 response
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});


//PUT
//Updates the menu with the specified menu ID using the information
//from the menu property of the request body and saves it to the
//database. Returns a 200 response with the updated menu on the menu
//property of the response body
//If any required fields are missing, returns a 400 response
//If a menu with the supplied menu ID doesn't exist, return 404 response
menusRouter.put('/:menuId', (req, res, next) => {
  const updatedMenu = req.body.menu;
  if (!updatedMenu.title) {
    res.status(400).send();
  };
  const sql = `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`;
  const values = {
    $title: updatedMenu.title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
            res.status(200).json({menu: menu});
        });
      }
  });
});


//DELETE
//Deletes the menu with the supplied menu ID from the database if that
//menu has no related menu items. Returns a 204 response
//If the menu with the supplied menu ID has related menu items,
//returns a 400 response
//If a menu with the supplied menu ID doesn't exist, return 404 response
menusRouter.delete('/:menuId', (req, res, next) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
  const values = {$menuId: req.params.menuId};
  db.get(sql, values, (error, menuItems) => {
    if (error) {
      next(error);
    } else if (menuItems) {
      res.status(400).send();
    } else {
      db.run(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        function (error) {
          if (error) {
            next(error);
          } else {
            res.status(204).json({});
          }
        });
    }
  });
});

module.exports = menusRouter;
