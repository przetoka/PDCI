const express = require('express');
const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver');
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

const neo4jUri = '';
const neo4jUser = '';
const neo4jPassword = '';

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
const session = driver.session();

app.use(express.json());

// Function to get the last ID for a given label from the database
async function getLastId(label) {
    const session2 = driver.session();
    const result = await session2.run(`MATCH (n:${label}) RETURN n.id ORDER BY n.id DESC LIMIT 1`);
    const lastId = result.records[0].get('n.id');
    return lastId ? parseInt(lastId) : 0;
}

// Function to create an ID for a new entity by incrementing the last ID
async function createId(label) {
    const lastId = await getLastId(label);
    return lastId + 1;
}

// Endpoint to add a new author
app.post('/authors', async (req, res) => {
    const { name, surname } = req.body;
    const authorId = await createId('Author');

    try {
	const sessionX = driver.session();
        await sessionX.run('CREATE (a:Author {id: ' + authorId + ', name: "' + name + '", surname: "' +  surname+ '"})');


        res.status(201).json({ id: authorId, name, surname });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to add a new book
app.post('/books', async (req, res) => {
    const { title, authorId, categoryId } = req.body;
    const bookId = await createId('Book');

    try {
	const session3 = driver.session();
        await session3.run(
            'MATCH (a:Author {id: ' + authorId + '})' +
            'CREATE (b:Book {id: ' + bookId + ', title: "' + title+ '"})<-[:WROTE]-(a)'
        );

	//res.status(201).json({ id: bookId, title, authorId, categoryId });
    } catch (error) {
        console.error(error);
	//res.status(500).json({ error: 'Internal Server Error' });
    }
    try {
	const session4 = driver.session();
        await session4.run(
            'MATCH (c:Category {id: ' + categoryId + '}), (b:Book {id: ' + bookId + '}) ' +
            'CREATE (b)-[:IS_CATEGORIZED_BY]->(c)'
        );

        res.status(201).json({ id: bookId, title, authorId, categoryId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get all categories
app.get('/categories', async (req, res) => {
  try {
    const result = await session.run('MATCH (c:Category) RETURN c');
    const categories = result.records.map(record => record.get('c').properties);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get all authors
app.get('/authors', async (req, res) => {
  try {
    const result = await session.run('MATCH (a:Author) RETURN a');
    const authors = result.records.map(record => record.get('a').properties);
    res.json(authors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get all books for a given category
app.get('/books', async (req, res) => {
  const categoryId = req.query.categoryId;
  try {
    const result = await session.run('MATCH (b:Book)-[:IS_CATEGORIZED_BY]->(c:Category {id: ' + categoryId + '}) RETURN b');
    const books = result.records.map(record => record.get('b').properties);
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Endpoint to get all books
app.get('/booksall', async (req, res) => {
    try {
      const result = await session.run('MATCH (b:Book) RETURN b');
      const books = result.records.map(record => record.get('b').properties);
      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// Endpoint to get the author for a given book
app.get('/booksauthor', async (req, res) => {
    const bookId = req.query.bookId;
    try {
      const result = await session.run('MATCH (a: Author)-[:WROTE]->(b:Book {id: ' + bookId + '}) RETURN a');
      const books = result.records.map(record => record.get('a').properties);
      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});

// Close the Neo4j session and driver when the process is terminated
process.on('exit', () => {
  session.close();
  driver.close();
});
