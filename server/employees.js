const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');



//api/employees
//Route param for employeeId;
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.status(404).send();
    }
  })
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

//GET
//Returns a 200 response containing all saved currently-employed
//employees (is_current_employee is equal to 1) on the employees
//property of the response body
employeesRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Employee WHERE is_current_employee = 1`;
  db.all(sql, (error, employees) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});

//POST
//Creates a new employee with the information from the employees
//property of the request body and saves it to the database. Returns a
//201 response with the newly-created employee on the employee
//property of the response body
//If any required fields are missing, returns a 400 response
employeesRouter.post('/', (req, res, next) => {
  const newEmployee = req.body.employee;
  if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
    res.status(400).send();
  }
  const sql = `INSERT INTO Employee (name, position, wage)
  VALUES ($name, $position, $wage)`;
  const values = {
    $name: newEmployee.name,
    $position: newEmployee.position,
    $wage: newEmployee.wage
  };
  db.run(sql, values, function (error) {
    if (error) {
      res.status(400).send();
    }
    db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
      (error, row) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({employee: row});
        }
      });
  });
});

//api/employees/:employeeId
//GET
//Returns a 200 response containing the employee with the supplied
//employee ID on the employee property of the response body
//If an employee with the supplied employee ID doesn't exist,
//returns a 404 response
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});


//PUT
//Updates the employee with the specified employee ID using the
//information from the employee property of the request body and saves
//it to the database. Returns a 200 response with the updated employee
//on the employee property of the response body
//If any required fields are missing, returns a 400 response
//If an employee with the supplied employee ID doesn't EXISTS
//returns a 404 response
employeesRouter.put('/:employeeId', (req, res, next) => {
  const updatedEmployee = req.body.employee;
  if (!updatedEmployee.name || !updatedEmployee.position || !updatedEmployee.wage) {
    res.status(400).send();
  };
  const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE Employee.id = $employeeId`;
  const values = {
    $name: updatedEmployee.name,
    $position: updatedEmployee.position,
    $wage: updatedEmployee.wage,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
            res.status(200).json({employee: employee});
        });
      }
  });
});


//DELETE
//Updates the employee with the specified employee ID to be
//unemployed (is_current_employee equal to 0). Returns a 200 response.
//If an employee with the supplied employee ID doesn't exist
//returns a 404 response
employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = `UPDATE Employee SET is_current_employee = $is_current_employee WHERE Employee.id = $employeeId`;
  const values = {
    $is_current_employee: 0,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});


module.exports = employeesRouter;
