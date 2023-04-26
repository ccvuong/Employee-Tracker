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
                    addDepartment();
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
    const query = `SELECT * FROM deparment`;

    db.query(query, (err, departments) => {
        if (err) throw err;
        console.table(departments);
        mainMenu();

    });
};

// all roles table function
const allRoles = () => {
    const query = `SELECT * FROM role`;

    db.query(query, (err, roles) => {
        if (err) throw err;
        console.table(roles);
        mainMenu();

    });
};

// all employees table function
const allEmployees = () => {
    const query = `SELECT * FROM employee`;

    db.query(query, (err, employees) => {
        if (err) throw err;
        console.table(employees);
        mainMenu();

    });
};

// add department to department table function
const addDepartment = () => {
    const query = `SELECT department_id AS "Departments" FROM department`;

    db.query(query, (err, newDepartment) => {
        if (err) throw err;

        console.table(chalk.yellow('List of current Departments'), newDepartment);

        inquirer.prompt([
            {
                type: 'input',
                name: 'newDepartment',
                message: 'Enter new name of Department:'
            }
        ]).then((answer) => {
            db.query(`INSERT INTO department(department_id) VALUES( ? )`, answer.newDepartment)
            mainMenu();
        })
    })
};


// add role to role table function
const addRole = () => {
    const query = `SELECT * FROM role; SELECT * FROM department`
    db.query(query, (err, newRole) => {
        if (err) throw err;

        console.table(chalk.yellow('List of current roles'), newRole);

        inquirer.prompt([
            {
                type: 'input',
                name: 'newTitle',
                message: 'Enter new role title:'
            },
            {
                type: 'input',
                name: 'newSalary',
                message: 'Enter salary amount:'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Select department for the role:',
                choices: [
                    { name: 'Engineering', value: 1 },
                    { name: 'Finance', value: 2 },
                    { name: 'Legal', value: 3 },
                    { name: 'Sale', value: 4 },
                ]
            }
        ]).then((answer) => {
            db.query(
                `INSERT INTO role(title, department_id, salary) 
                VALUES ( ?, ?, ?)
                ('${answer.newTitle}', '${answer.newSalary}',
                (SELECT id FROM department WHERE department_id = '${answer.department}'));`
            )
            mainMenu();
        })
    })
}