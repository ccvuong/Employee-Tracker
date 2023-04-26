const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.port || 3001;
const app = express();

// express middleware
app.use(express.urlencoded({ extended: false }));

// mysql connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'employee_db'
    },
);

db.connect(function (err) {
    if (err) throw err
    console.log('Connected to the employee database')
    startPrompt();
});

// menu prompt questions
const mainMenu = () => {

    inquirer.prompt([
        {
            type: 'list',
            name: 'menu',
            message: 'Select a catagory:',
            choices: [

                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',

            ]
        }
    ])

        .then(answer => {
            switch (answer.menu) {
                case 'View all departments':
                    allDepartments();
                    break;

                case 'View all roles':
                    allRoles();
                    break;

                case 'View all employees':
                    allEmployees();
                    break;

                case 'Add a department':
                    addDeparment();
                    break;

                case 'Add a role':
                    addRole();
                    break;

                case 'Add an employee':
                    addEmployee();
                    break;

                case 'Update an employee role':
                    updateEmployee();
                    break;

            }
        })

}

// all departments table function
const allDepartments = () => {
    const query = `SELECT * FROM deparments`;
    
    db.query(query, (err, departments) => {
        if (err) throw err;
        console.table(departments);
        mainMenu();
    });
};