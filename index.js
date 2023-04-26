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
        port: 3001,
        user: 'root',
        password: 'password',
        database: 'employee_db',
    },
);

db.connect(function (err) {
    if (err) throw err;
    console.log('Connected to the employee database');
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
    const query = `SELECT * FROM department`;

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
    const query = `SELECT * FROM role; SELECT * FROM department`;
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
};

// add employee to employee table function
const addEmployee = () => {
    const query = `SELECT * FROM role; SELECT * FROM department, SELECT * FROM employee`;

    db.query(query, (err, newEmployee => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "Enter the employee's first name:"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "Enter the employee's last name:"
            },
            {
                type: 'list',
                name: 'theRole',
                message: "Select the employee's role:",
                choices: [
                    { name: 'Sales Lead', value: 1 },
                    { name: 'Salesperson', value: 2 },
                    { name: 'Lead Engineer', value: 3 },
                    { name: 'Software Engineer', value: 4 },
                    { name: 'Account Manager', value: 5 },
                    { name: 'Accountant', value: 6 },
                    { name: 'Legal Team Lead', value: 7 },
                    { name: 'Lawyer', value: 8 }
                ]
            },
            {
                type: 'list',
                name: 'newManager',
                message: "Add employee's manager:",
                choices: [
                    { name: 'John Doe', value: 1 },
                    { name: 'Ashely Rodriguez', value: 3 },
                    { name: 'Kunal Singh', value: 5 },
                    { name: 'Sarah Lourd', value: 7 }
                ]
            }
        ]).then((answer) => {
            db.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`)
            mainMenu();

        })

    }))
};

// update employee role function
const updateEmployee = () => {
    const query = `SELECT last_name FROM employee; SELECT title FROM role`
    db.query(query, (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'upEmployee',
                message: 'Select employee to update their role',
                choices: res.map(({ last_name }) => last_name)
            },
            {
                type: 'list',
                name: 'upRole',
                message: 'Select new role for employee:',
                choices: [
                    { name: 'Sales Lead', value: 1 },
                    { name: 'Salesperson', value: 2 },
                    { name: 'Lead Engineer', value: 3 },
                    { name: 'Software Engineer', value: 4 },
                    { name: 'Account Manager', value: 5 },
                    { name: 'Accountant', value: 6 },
                    { name: 'Legal Team Lead', value: 7 },
                    { name: 'Lawyer', value: 8 }
                ]
            }
        ]).then((answer) => {
            db.query(`UPDATE employee SET role_id = ? WHERE last_name = ?, [parseInt(role_id), last_name] `),
                [answer.upEmployee, answer.upRole],
                (err, res) => {
                    if (err) throw err;
                    mainMenu();
                }

        })
    })
}