const express = require('express');
const path = require("path");

const app = express();
const port = 3000;

app.use('/js',express.static('js'))
app.use('/css',express.static('css'))
app.use('/images',express.static('images'))
app.use('Components', express.static('Components'))

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./", "index.html"));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./", "signup_signin.html"));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./", "signup_signin.html"));
});

app.get('/test', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./", "test-component.html"));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
