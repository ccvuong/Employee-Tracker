require("dotenv").config();

const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const app = express();

// express middleware
app.use(express.urlencoded({ extended: false }));

// mysql connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
);

db.connect(function (err) {
    if (err) throw err;
    console.log('Connected to the employee database');
    mainMenu();
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
    ]).then(answer => {
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

};

// all departments table function
const allDepartments = () => {
    const query = `SELECT * FROM department`;

    db.query(query, (err, results) => {
        if (err) throw err;

        console.table(results);
        mainMenu();
    });
};

// all roles table function
const allRoles = () => {
    const query = `SELECT * FROM role`;

    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
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
    const query = `SELECT department_name AS "Departments" FROM department`;

    db.query(query, (err, results) => {
        if (err) throw err;

        console.table(('List of current Departments'), results);

        inquirer.prompt([
            {
                type: 'input',
                name: 'newDepartment',
                message: 'Enter new name of Department:'
            }
        ]).then((answer) => {
            db.query(`INSERT INTO department (department_name) VALUES( ? )`, answer.newDepartment)
            console.log("NEW DEPARTMENT ADDED")

            mainMenu();
        });

    });
};


// add role to role table function
const addRole = () => {
    const query = `SELECT * FROM department`;
    const deptChoices = [];

    db.query(query, (err, results) => {
        if (err) throw err;

        results.forEach(({ department_name, id }) => {
            deptChoices.push({
                name: department_name,

                id: id
            })
        });
    })

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
            message: 'Select a department for the new role:',
            choices: deptChoices
        }
    ]).then((answer) => {
        // for loop on new department name
        let deptID
        for (var i = 0; i < deptChoices.length; i++) {
            if (answer.department == deptChoices[i].name)
                deptID = deptChoices[i].id
        }

        db.query(
            `INSERT INTO role ( title, salary, department_id ) 
            VALUES ( "${answer.newTitle}", "${answer.newSalary}","${deptID}" )`

        )
        console.log('NEW ROLE ADDED');

        mainMenu();
    })

};

// add employee to employee table function
const addEmployee = () => {
    const employeeRoles = [];
    const managerNames = [];

    // roles available 
    db.query(`SELECT * FROM role`, (err, results) => {
        if (err) throw err;

        results.forEach(({ title, department_id, salary, id }) => {
            employeeRoles.push({
                name: title,
                employee_ID: department_id,
                salary: salary,

                id: id
            })
        });
    })

    // managers available
    db.query(`SELECT * FROM employee`, (err, results) => {
        if (err) throw err;

        results.forEach(({ first_name, last_name, role_id, manager_id, id }) => {
            managerNames.push({
                name: first_name + ' ' + last_name,
                roleID: role_id,
                manager_ID: manager_id,

                id: id

            })
        });
    })

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
            choices: employeeRoles
        },
        {
            type: 'list',
            name: 'theManager',
            message: "Add the employee's manager:",
            choices: managerNames
        }
    ]).then((answer) => {
        // for loop for role selected
        let roleID
        for (var i = 0; i < employeeRoles.length; i++) {
            if (answer.theRole == employeeRoles[i].name)
                roleID = employeeRoles[i].id
        }


        // for loop for manager name selected
        let managerID
        for (var i = 0; i < managerNames.length; i++) {
            if (answer.theManager == managerNames[i].name)
                managerID = managerNames[i].id
        }

        db.query(`INSERT INTO employee ( first_name, last_name, role_id, manager_id ) 
            VALUES ( "${answer.firstName}", "${answer.lastName}", "${roleID}", "${managerID}" )`

        )
        console.log('NEW EMPLOYEE ADDED')

        mainMenu();

    })


};

// update employee role function
const updateEmployee = () => {
    const selectEmployee = [];
    const changingRole = [];

    // selecting available employees
    db.query(`SELECT first_name FROM employee`, (err, results) => {
        if (err) throw err;

        results.forEach(({ first_name, last_name, role_id, manager_id, id }) => {
            selectEmployee.push({
                name: first_name + ' ' + last_name,
                roleID: role_id,
                manager_ID: manager_id,

                id: id
            })
        });

    })

    // selecting from available roles 
    db.query(`SELECT title FROM role`, (err, results) => {
        if (err) throw err;

        results.forEach(({ title, department_id, salary, id }) => {
            changingRole.push({
                name: title,
                deptRoleID: department_id,
                salary: salary,

                id: id
            })
        });

    })

    inquirer.prompt([
        {
            type: 'list',
            name: 'upEmployee',
            message: 'Select an employee to update their role',
            choices: selectEmployee
        },
        {
            type: 'list',
            name: 'upRole',
            message: 'Select new role for employee:',
            choices: changingRole
        }
    ]).then((answer) => {
        // for loop for employee selected
        let pickEmployee
        for (var i = 0; i < selectEmployee.length; i++) {
            if (answer.upRole == selectEmployee[i].name)
                pickEmployee = selectEmployee[i].id
        }

        // for loop for role selected
        let roleChange
        for (var i = 0; i < changingRole.length; i++) {
            if (answer.upRole == changingRole[i].name)
                roleChange = changingRole[i].id
        }

        db.query(`UPDATE employee ( first_name, last_name, role_id ) 
        VALUES ( "${answer.selectEmployee}", "${answer.changingRole}")`

        )
        console.log('EMPLOYEE UPDATED')

        mainMenu();

    })
   

}