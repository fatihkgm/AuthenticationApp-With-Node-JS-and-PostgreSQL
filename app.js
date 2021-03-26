const express = require('express');
const app = express();
const ejs = require('ejs');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}

app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});
