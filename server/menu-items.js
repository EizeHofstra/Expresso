const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//api/menus/:menuId/menu-items
//Router param for menu-itemId
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const values = {$menuItemId: menuItemId};
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.status(404).send();
    }
  });
});


//GET
//Returns a 200 response containing all saved menu items related to the
//menu with the supplied menu ID on the menuItems property of the
//response body
//If a menu with the supplied menu ID doesn't exist, return 404 response
menuItemsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
  const values = {$menuId: req.params.menuId};
  db.all(sql, values, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});



//POST
//Creates a new menu item, related to the menu with the supplied menu
//ID, with the information from the menuItem property of the request
//body and saves it to the database. Returns a 201 response with the
//newly-created menu item on the menuItem property of the response body
//If any required fields are missing, returns a 400 response
//If a menu with the supplied menu ID doesn't exist, return 404 response
menuItemsRouter.post('/', (req, res, next) => {
  const newMenuItem = req.body.menuItem;
  if (!newMenuItem.name || !newMenuItem.inventory || !newMenuItem.price) {
    res.status(400).send();
  }
  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
  VALUES ($name, $description, $inventory, $price, $menu_id)`;
  const values = {
    $name: newMenuItem.name,
    $description: newMenuItem.description,
    $inventory: newMenuItem.inventory,
    $price: newMenuItem.price,
    $menu_id: req.params.menuId
  };

  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    }
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
      (error, row) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({menuItem: row});
        }
      });
  });
});

//api/menus/:menuId/menu-items/:menuItemId

//PUT
//Updates the menu item with the specified menu item ID using the
//information from the menuItem property of the request body and saves
//it to the database. Returns a 200 response with the updated menu
//item on the menuItem property of the response body
//If any required fields are missing, returns a 400 response
//If a menu with the supplied menu ID doesn't exist, return 404 response
//If a menu item with the supplied menu item ID doesn't exist,
//returns a 404 response
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const updatedMenuItem = req.body.menuItem;
  if (!updatedMenuItem.name || !updatedMenuItem.description || !updatedMenuItem.inventory || !updatedMenuItem.price) {
    res.status(400).send();
  };
  const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId`;
  const values = {
    $name: updatedMenuItem.name,
    $description: updatedMenuItem.description,
    $inventory: updatedMenuItem.inventory,
    $price: updatedMenuItem.price,
    $menuItemId: req.params.menuItemId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (error, menuItem) => {
            res.status(200).json({menuItem: menuItem});
        });
      }
  });
});


//DELETE
//Deletes the menu item with the supplied menu item ID from the
//database. Returns a 204 response
//If a menu with the supplied menu ID doesn't exist, return 404 response
//If a menu item with the supplied menu item ID doesn't exist,
//returns a 404 response
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = `DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const values = {$menuItemId: req.params.menuItemId};
  db.run(sql, values, function(error) {
    if (error) {
      next (error);
    } else {
      res.status(204).json({});
    }
  });
})


module.exports = menuItemsRouter;
