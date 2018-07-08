const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



//api/employees/:employeeId/timesheets
//Router param for timesheetId
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.status(404).send();
    }
  })
});

//GET
//Returns a 200 response containing all saved timesheets related to the
//employee with the supplied employee ID on the timesheets property of
//the response body
//If an employee with the supplied employee ID doesn't exist
//returns a 404 response.
timesheetsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`;
  const values = {$employeeId: req.params.employeeId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});


//POST
//Creates a new timesheet, related to the employee with the supplied
//employee ID, with the information from the timesheet property of the
//request body and saves it to the database. Returns a 201 response
//with the newly-created timesheet on the timesheet property of the
//response body
//If an employee with the supplied employee ID doesn't exist
//returns a 404 response
timesheetsRouter.post('/', (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  if (!newTimesheet.hours || !newTimesheet.rate || !newTimesheet.date) {
    res.status(400).send();
  }
  const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id)
  VALUES ($hours, $rate, $date, $employee_id)`;
  const values = {
    $hours: newTimesheet.hours,
    $rate: newTimesheet.rate,
    $date: newTimesheet.date,
    $employee_id: req.params.employeeId
  };
  db.run(sql, values, function (error) {
    if (error) {
      res.status(400).send();
    }
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
      (error, row) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({timesheet: row});
        }
      });
  });
});

//api/employees/:employeeId/timesheets/:timesheetId
//PUT
//Updates the timesheet with the specified timesheet ID using the
//information from the timesheet property of the request body and saves
//it to the database. Returns a 200 response with the updated timesheet
//on the timesheet property of the response body
//If any of the required fields are missing, returns a 400 response
//If an employee with the supplied employee ID doesn't exist
//returns a 404 response
//If a timesheet with the supplied timesheet ID doesn't exist
//returns a 404 response
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const updatedTimesheet = req.body.timesheet;
  if (!updatedTimesheet.hours || !updatedTimesheet.rate || !updatedTimesheet.date) {
    res.status(400).send();
  };
  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.id = $timesheetId`;
  const values = {
    $hours: updatedTimesheet.hours,
    $rate: updatedTimesheet.rate,
    $date: updatedTimesheet.date,
    $timesheetId: req.params.timesheetId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (error, timesheet) => {
            res.status(200).json({timesheet: timesheet});
        });
      }
  });
});


//DELETE
//Deletes the timesheet with the supplied timesheet ID from the
//database. Returns a 204 response.
//If an employee with the supplied employee ID doesn't exist
//returns a 404 response
//If a timesheet with the supplied timesheet ID doesn't exist
//returns a 404 response
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = `DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  const values = {$timesheetId: req.params.timesheetId};
  db.run(sql, values, function(error) {
    if (error) {
      next (error);
    } else {
      res.status(204).json({});
    }
  });
})



module.exports = timesheetsRouter;
