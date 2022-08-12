const fs = require('fs');
const file = 'src/index.html';
const from = process.argv[2];
const to = process.argv[3];

if (!from || !to) {
    console.log('Strings to replace not specified');
    return;
}

fs.readFile(file, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  const result = data.replace(
    `document.API_BASE_URL = \'${from}';`,
    `document.API_BASE_URL = \'${to}\';`);

  fs.writeFile(file, result, 'utf8', function (err) {
     if (err) {
        return console.log(err);
    }
  });
});
