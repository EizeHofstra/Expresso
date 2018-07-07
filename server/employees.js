const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');
employeesRouter.use(':employeeId/timesheet', timesheetsRouter);


//api/employees
//GET
//Returns a 200 response containing all saved currently-employed
//employees (is_current_employee is equal to 1) on the employees
//property of the response body
employeesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM WHERE is_current_employee = 1;`, (error, rows) => {
    if (error) {
      next(error);
    } else if (rows) {
      res.status(200).send ({employees: rows});
    } else {
      ret.status(404);
    }
  })
})

//POST
//Creates a new employee with the information from the employees
//property of the request body and saves it to the database. Returns a
//201 response with the newly-created employee on the employee
//property of the response body
//If any required fields are missing, returns a 400 response


//api/employees/:employeeId
//GET
//Returns a 200 response containing the employee with the supplied
//employee ID on the employee property of the response body
//If an employee with the supplied employee ID doesn't exist,
//returns a 404 response

//PUT
//Updates the employee with the specified employee ID using the
//information from the employee property of the request body and saves
//it to the database. Returns a 200 response with the updated employee
//on the employee property of the response body
//If any required fields are missing, returns a 400 response
//If an employee with the supplied employee ID doesn't EXISTS
//returns a 404 response

//DELETE
//Updates the employee with the specified employee ID to be
//unemployed (is_current_employee equal to 0). Returns a 200 response.
//If an employee with the supplied employee ID doesn't exist
//returns a 404 response



module.exports = employeesRouter;
