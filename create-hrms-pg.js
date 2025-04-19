const { Client } = require('pg');
const { faker } = require('@faker-js/faker');

const connectionString = 'postgresql://postgres.lbnlgrzohcrfkjddkheh:9QQdZrK6m6mRLnQ8@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({ connectionString });

async function main() {
  try {
    console.time('⏳ Total time');
    await client.connect();

    const run = (query, params = []) => client.query(query, params);

    // Drop tables
    await run(`DROP TABLE IF EXISTS attendance`);
    await run(`DROP TABLE IF EXISTS leave_requests`);
    await run(`DROP TABLE IF EXISTS employees`);
    await run(`DROP TABLE IF EXISTS departments`);
    await run(`DROP TABLE IF EXISTS job_titles`);

    // Create tables
    await run(`
      CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);

    await run(`
      CREATE TABLE job_titles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL
      )
    `);

    await run(`
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        department_id INTEGER REFERENCES departments(id),
        job_title_id INTEGER REFERENCES job_titles(id),
        hire_date DATE,
        salary NUMERIC
      )
    `);

    await run(`
      CREATE TABLE attendance (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id),
        date DATE,
        status TEXT
      )
    `);

    await run(`
      CREATE TABLE leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id),
        start_date DATE,
        end_date DATE,
        reason TEXT,
        status TEXT
      )
    `);

    // Insert departments & job titles
    const departments = ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Support', 'IT'];
    const jobTitles = ['Software Engineer', 'HR Manager', 'Sales Rep', 'Marketing Lead', 'Accountant', 'DevOps Engineer', 'Product Manager'];

    for (const dept of departments) {
      await run(`INSERT INTO departments (name) VALUES ($1)`, [dept]);
    }

    for (const title of jobTitles) {
      await run(`INSERT INTO job_titles (title) VALUES ($1)`, [title]);
    }

    // Insert 100 employees
    console.log('👷 Generating employees...');
    for (let i = 0; i < 100; i++) {
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const email = faker.internet.email({ firstName: first, lastName: last });
      const phone = faker.phone.number();
      const deptId = faker.number.int({ min: 1, max: departments.length });
      const jobId = faker.number.int({ min: 1, max: jobTitles.length });
      const hireDate = faker.date.past({ years: 5 });
      const salary = faker.number.float({ min: 30000, max: 120000 });

      await run(
        `INSERT INTO employees 
         (first_name, last_name, email, phone, department_id, job_title_id, hire_date, salary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [first, last, email, phone, deptId, jobId, hireDate.toISOString().split('T')[0], salary]
      );
    }

    // Attendance (1 year per employee)
    console.log('📅 Generating attendance records...');
    const empRes = await client.query(`SELECT id FROM employees`);
    const employeeIds = empRes.rows.map((r) => r.id);
    const statusOptions = ['Present', 'Absent', 'Leave', 'WFH'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);

    const attendanceBatch = [];

    for (const empId of employeeIds) {
      for (let d = 0; d < 365; d++) {
        const date = new Date(yearAgo);
        date.setDate(date.getDate() + d);
        const status = faker.helpers.arrayElement(statusOptions);
        attendanceBatch.push(
          client.query(
            `INSERT INTO attendance (employee_id, date, status) VALUES ($1, $2, $3)`,
            [empId, date.toISOString().split('T')[0], status]
          )
        );
      }
    }

    await Promise.all(attendanceBatch);
    console.log('✅ Attendance inserted');

    // Leave requests
    console.log('✈️ Generating leave requests...');
    for (const empId of employeeIds) {
      const leaveCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < leaveCount; i++) {
        const start = faker.date.between({ from: yearAgo, to: today });
        const end = new Date(start);
        end.setDate(start.getDate() + faker.number.int({ min: 1, max: 5 }));
        const reason = faker.lorem.sentence();
        const status = faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']);

        await run(
          `INSERT INTO leave_requests 
           (employee_id, start_date, end_date, reason, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [empId, start.toISOString().split('T')[0], end.toISOString().split('T')[0], reason, status]
        );
      }
    }

    console.timeEnd('⏳ Total time');
    console.log('🎉 PostgreSQL HRMS database populated!');
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
  }
}

main();
