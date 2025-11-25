const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    multipleStatements: true // Keep this true just in case, but we will split manually
};

const connection = mysql.createConnection(dbConfig);

const sqlPath = path.join(__dirname, 'setup_database.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Split by semicolon, but filter out empty lines/whitespace
const queries = sqlContent
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

console.log(`Found ${queries.length} queries to execute.`);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL server:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL server.');

    executeQueries(queries, 0);
});

function executeQueries(queries, index) {
    if (index >= queries.length) {
        console.log('All queries executed successfully.');
        connection.end();
        return;
    }

    const query = queries[index];
    console.log(`Executing query ${index + 1}/${queries.length}...`);
    // console.log(query.substring(0, 50) + '...'); 

    connection.query(query, (err, results) => {
        if (err) {
            console.error(`Error executing query ${index + 1}:`, err);
            console.error('Query:', query);
            process.exit(1);
        }
        log(`Query ${index + 1} executed.`);
        if (results && results.affectedRows !== undefined) {
            log(`Affected rows: ${results.affectedRows}`);
        }
        if (results && Array.isArray(results)) {
            log('Results: ' + JSON.stringify(results));
        }
        executeQueries(queries, index + 1);
    });
}

function log(message) {
    console.log(message);
    fs.appendFileSync(path.join(__dirname, 'db_setup_log.txt'), message + '\n');
}
