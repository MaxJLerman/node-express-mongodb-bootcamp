const fs = require("fs");
const superagent = require("superagent");

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject("could not find file");
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject("Could not write file");
      resolve("success");
    });
  });
};

const getDogImage = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    const response = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`,
    );
    console.log(response.body.message);

    await writeFilePromise("dog-img.txt", response.body.message);
    console.log("random dog image saved to file");
  } catch (error) {
    console.log(error.message);
  }
};

getDogImage();

//! old method of achieving above function
// readFilePromise(`${__dirname}/dog.txt`)
//   .then((data) => {
//     console.log(`Breed: ${data}`);
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((res) => {
//     console.log(res.body.message);
//     return writeFilePromise("dog-img.txt", res.body.message);
//   })
//   .then(() => {
//     console.log("random dog image saved to file");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });
