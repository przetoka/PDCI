const apiUrl = 'http://13.51.238.66:3000';

async function populate() {
    const categoryButtonsDiv = document.getElementById('categoryButtons');
    
    try {
        const response = await fetch(`${apiUrl}/categories`);
        const categories = await response.json();

        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.category;
            button.value = category.id.low;
            button.addEventListener('click', () => getRandomBookByCategory(category.id.low));
            categoryButtonsDiv.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    const bookCategorySelect = document.getElementById('bookCategory');
    
    try {
        const response = await fetch(`${apiUrl}/categories`);
        const categories = await response.json();

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id.low;
            option.text = category.category;
            bookCategorySelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    const bookAuthorsSelect = document.getElementById('bookAuthor');
    
    try {
        const response = await fetch(`${apiUrl}/authors`);
        const authors = await response.json();

        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.id.low;
            option.text = author.name + " " + author.surname;
            bookAuthorsSelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
    }
}

async function getRandomBooksAuthor(bookId) {
    try {
        const booksAuthorResponse = await fetch(`${apiUrl}/booksauthor?bookId=${bookId}`);
        const booksAuthor = await booksAuthorResponse.json();

        displayRandomAuthors(booksAuthor[0]);

    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

async function getRandomBookByCategory(categoryId) {
    try {
        const booksResponse = await fetch(`${apiUrl}/books?categoryId=${categoryId}`);
        const books = await booksResponse.json();

        const randomBook = getRandomElement(books);
        
        displayBookInfo(randomBook);
        getRandomBooksAuthor(randomBook.id.low);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function displayBookInfo(book) {
    const bookListDiv = document.getElementById('bookList');
    bookListDiv.innerHTML = `<h2>Random Book from the Category</h2>
                                <p><strong>Title:</strong> ${book.title}</p>`;
}

async function displayRandomAuthors(correctAuthor) {
    const authorButtonsDiv = document.getElementById('authorButtons');
    authorButtonsDiv.innerHTML = '';

    try {
        const response = await fetch(`${apiUrl}/authors`);
        const authors = await response.json();

        // Shuffle the authors and pick four
        shuffledAuthors = shuffle(authors).slice(0, 3);
        shuffledAuthors.push(correctAuthor);
        shuffledAuthors = shuffle(shuffledAuthors);

        shuffledAuthors.forEach(author => {
            const button = document.createElement('button');
            button.textContent = `${author.name} ${author.surname}`;
            button.value = author.id.low;
            button.addEventListener('click', () => checkAuthor(author.id.low, correctAuthor.id.low));
            authorButtonsDiv.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
    }
}

function checkAuthor(chosenAuthorId, correctAuthorId) {
    const resultDiv = document.getElementById('authorButtons');
    resultDiv.innerHTML = `<p><strong>Result:</strong> ${
        chosenAuthorId === correctAuthorId ? 'Correct!' : 'Incorrect!'
    }</p>`;
    showTryAgainButton();
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.onload = populate;

async function resetPage() {
    document.getElementById('bookList').innerHTML = '';
    document.getElementById('authorButtons').innerHTML = '';
    
    document.getElementById('categoryButtons').innerHTML = '';

    const tryAgainButton = document.getElementById('tryAgainButton');
    tryAgainButton.style.display = 'none';

    populate();
}

function showTryAgainButton() {
    const tryAgainButton = document.getElementById('tryAgainButton');
    tryAgainButton.style.display = 'block';
}

async function addAuthor() {
    const name = document.getElementById('authorFirstName').value;
    const surname = document.getElementById('authorLastName').value;

    if (!name || !surname) {
        alert('Please enter both first name and last name.');
        return;
    }

    fetch(`${apiUrl}/authors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            surname: surname,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Author added successfully:', data);
    })
    .catch(error => {
        console.error('Error adding author:', error);
    });
    resetPage();
}

async function addBook() {
    const title = document.getElementById('bookTitle').value;
    const category = document.getElementById('bookCategory').value;
    const author = document.getElementById('bookAuthor').value;
    console.log(category);
    console.log(author);

    if (!title || !category || !author) {
        alert('Please enter book title, category, and author.');
        return;
    }

    fetch(`${apiUrl}/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            categoryId: category,
            authorId: author,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book added successfully:', data);
    })
    .catch(error => {
        console.error('Error adding book:', error);
    });
    resetPage();
}
