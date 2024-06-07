# Natours + MongoDB

This README includes how to run MongoDB Shell & MongoDB Server for a local database connection. Local database connections are easier to use when developing, but once an application is production ready you should probably switch over to using MongoDB Atlas (or equivalent) instead.

I use Git Bash for my terminal, so if you use another one some commands may differ.

## Installing MongoDB Shell & Server

Install MongoDB Shell from [here](https://www.mongodb.com/try/download/shell).

The default location for MongoDB Shell is usually: C:\Users\YOUR_USER\AppData\Local\Programs\mongosh\

Install MongoDB Server from [here](https://www.mongodb.com/try/download/community).

Make sure to install MongoDB Compass too in the Server installation process.

## Running MongoDB Server

Navigate to the drive where MongoDB was installed. In my case, its Local Disk C.

Create a new folder called "data":

```
USER@DESKTOP MINGW64 /c
$ mkdir data
```

Inside the "data" folder, create a new folder called "db":

```
USER@DESKTOP MINGW64 /c/data
$ mkdir db
```

Now navigate back to the C drive and go to:

```
USER@DESKTOP MINGW64 /c
$ cd Program\ Files/MongoDB/Server/AVAILABLE_VERSION/bin
```

Now run the "mongod.exe" file to run the MongoDB Server:

```
USER@DESKTOP MINGW64 /c/Program Files/MongoDB/Server/7.0/bin
$ ./mongod
```

As the server starts up, you should see that it is listening on port `27017`.

## Running MongoDB Shell

Now we need a shell to connect to the server to manipulate our databases.

Navigate to where MongoDB Shell was installed:

```
USER@DESKTOP MINGW64 ~
$ cd AppData/Local/Programs/mongosh
```

Now run the "mongosh.exe" file:

```
USER@DESKTOP MINGW64 ~/AppData/Local/Programs/mongosh
$ ./mongosh
```

## Using MongoDB Shell

To create a new database or navigate to an existing one, type the command "use" followed by the name of the database you want to connect to:

```
> use natours-test
```

To list all existing databases, type "show dbs":

```
natours-test> show dbs
admin         40.00 KiB
config       108.00 KiB
local         72.00 KiB
natours-test  40.00 KiB
```

To display the name of the database you're currently in, type the command "db":

```
natours-test> db
natours-test
```

To delete the contents of a database, navigate to the one you want to drop and type the command "db.dropDatabase()":

```
natours-test> db.dropDatabase()
{ ok: 1, dropped: 'natours-test' }
natours-test> show dbs
admin         40.00 KiB
config       108.00 KiB
local         72.00 KiB
```

As you can see from the terminal output, natours-test is no longer available (even though it says the name in the terminal input line, this is because the database is empty). To create it again, add a document to a collection in it and it will show as populated in the "show dbs" output once again.

For the purpose of the _Natours_ application, I will be using a cloud-hosted MongoDB Atlas. To connect to it using the MongoDB Shell CLI, navigate to the directory and run the following command:

```
USER@DESKTOP MINGW64 ~/AppData/Local/Programs/mongosh
$ mongosh "mongodb+srv://cluster0.jylhnvu.mongodb.net/" --apiVersion 1 --username max
```

When prompted, enter the password in the `config.env` file specified as **DATABASE_PASSWORD**. Then navigate to the _natours_ database with the "use" command and now we can manipulate the documents and collections inside.

## Inserting documents into a database

To insert one document, specify the collection using dot notation and use the command "insertOne" like so:

```
natours-test> db.tours.insertOne({ name: "The Forest Hiker", price: 297, rating: 4.7 })
{
  acknowledged: true,
  insertedId: ObjectId('6655c02549eb5a8912cdcdf6')
}
```

Now that the database has a collection, you can view them with the command "show collections":

```
natours-test> show collections
tours
```

To insert many documents, specify the collection using dot notation and use the command "insertMany":

```
natours-test> db.tours.insertMany([{ name: "The Sea Explorer", price: 497, rating: 4.8 }, { name: "The Snow Adventurer", price: 997, rating: 4.9, difficulty: "easy" }])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('6655c2ae49eb5a8912cdcdf7'),
    '1': ObjectId('6655c2ae49eb5a8912cdcdf8')
  }
}
```

## Querying (reading) documents

To view all the objects in the _tours_ collection, use the "find()" command:

```
natours-test> db.tours.find()
[
  {
    _id: ObjectId('6655c02549eb5a8912cdcdf6'),
    name: 'The Forest Hiker',
    price: 297,
    rating: 4.7
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf7'),
    name: 'The Sea Explorer',
    price: 497,
    rating: 4.8
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf8'),
    name: 'The Snow Adventurer',
    price: 997,
    rating: 4.9,
    difficulty: 'easy'
  }
]
```

To query a particular object, pass in the filter as an object inside the "find()" command:

```
natours-test> db.tours.find({ name: "The Forest Hiker" })
[
  {
    _id: ObjectId('6655c02549eb5a8912cdcdf6'),
    name: 'The Forest Hiker',
    price: 297,
    rating: 4.7
  }
]

natours-test> db.tours.find({ difficulty: "easy" })
[
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf8'),
    name: 'The Snow Adventurer',
    price: 997,
    rating: 4.9,
    difficulty: 'easy'
  }
]
```

For more elaborate queries, such as querying tours with a price less than or equal to 500, use the command below:

```
natours-test> db.tours.find({ price: { $lte: 500 } })
[
  {
    _id: ObjectId('6655c02549eb5a8912cdcdf6'),
    name: 'The Forest Hiker',
    price: 297,
    rating: 4.7
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf7'),
    name: 'The Sea Explorer',
    price: 497,
    rating: 4.8
  }
]
```

To query tours with a price less than 500 **AND** a rating greater than or equal to 4.8, use the command below:

```
natours-test> db.tours.find({ price: { $lt: 500 }, rating: { $gte: 4.8 } })
[
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf7'),
    name: 'The Sea Explorer',
    price: 497,
    rating: 4.8
  }
]
```

To query tours with a price less than 500 **OR** a rating greater than or equal to 4.8, use the command below:

```
natours-test> db.tours.find({ $or: [ { price: { $lt: 500 } }, { rating: { $gte: 4.8 } } ] })
[
  {
    _id: ObjectId('6655c02549eb5a8912cdcdf6'),
    name: 'The Forest Hiker',
    price: 297,
    rating: 4.7
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf7'),
    name: 'The Sea Explorer',
    price: 497,
    rating: 4.8
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf8'),
    name: 'The Snow Adventurer',
    price: 997,
    rating: 4.9,
    difficulty: 'easy'
  }
]
```

To specify which fields should be outputted, after the OR object add the desired property set to "1" inside an object like so:

```
natours-test> db.tours.find({ $or: [ { price: { $lt: 500 } }, { rating: { $gte: 4.8 } } ] }, { name: 1 })
[
  {
    _id: ObjectId('6655c02549eb5a8912cdcdf6'),
    name: 'The Forest Hiker'
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf7'),
    name: 'The Sea Explorer'
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf8'),
    name: 'The Snow Adventurer'
  }
]
```

## Updating documents

To update a single document, specify which document should be updated by using any of the properties as the first argument and use the _set_ operator like so:

```
natours-test> db.tours.updateOne({ name: "The Snow Adventurer" }, { $set: { price: 597 } })
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

To update all the documents to have a _premium_ property set to "true" where the price is greater than 500 **AND** the rating is greater than or equal to 4.8, use the command below:

```
natours-test> db.tours.updateMany({ price: { $gt: 500 }, rating: { $gte: 4.8 } }, { $set: { premium: true } })
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}

natours-test> db.tours.find({ price: { $gt: 500 }, rating: { $gte: 4.8 } })
[
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf8'),
    name: 'The Snow Adventurer',
    price: 597,
    rating: 4.9,
    difficulty: 'easy',
    premium: true <----------------- new property
  }
]
```

## Deleting documents

To delete documents with a rating of less that 4.8, use the command below:

```
natours-test> db.tours.deleteMany({ rating: { $lt: 4.8 } })
{ acknowledged: true, deletedCount: 1 }

natours-test> db.tours.find()
[
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf7'),
    name: 'The Sea Explorer',
    price: 497,
    rating: 4.8
  },
  {
    _id: ObjectId('6655c2ae49eb5a8912cdcdf8'),
    name: 'The Snow Adventurer',
    price: 597,
    rating: 4.9,
    difficulty: 'easy',
    premium: true
  }
]
^the tour document with a rating of 4.7 has been deleted.
```

To delete all the documents in a collection, simply use the command:

```
natours-test> db.tours.deleteMany({})
{ acknowledged: true, deletedCount: 2 }

natours-test> db.tours.find()     <------- returns nothing
```

## Using Mailtrap

- Visit [mailtrap's site](https://mailtrap.io/) and sign up.

- Create an inbox, naming it _appropriately_.

- Switch to VS Code and specify the **host**, **port**, **username** and **password** from your Mailtrap inbox in your Nodemailer transport configuration. _Don't forget to save sensitive information inside environment variables._

- Define the email options: from, to, subject and message body, potentially even HTML.

- Send the email.

## Data Sanitisation

The packages `express-mongo-sanitise` and `xss-clean` are used for NoSQL Query Injection and Cross Site Scripting respectively.

The former prevents attacks such as the following, which aims to login to an account with just a password:

```
{
  "email": { "$gt": "" },
  password: "password"
}
```

Whereas the latter prevents attacks in the form of this:

```
  "name": "<div id='bad-code'>Name</div>"
```

Due to the [recreated](https://github.com/MaxJLerman/node-express-mongodb-bootcamp/blob/main/natours/src/lib/xss.js) package changing the entered data into this output:

```
"name": "&lt;div id='bad-code'>Name&lt;/div>",
```

## HTTP Parameter Pollution

By querying the URL: `{{API}}/api/v1/tours?sort=duration&sort=price`, the _sort_ parameter is set twice, leading the application to output an error as it's trying to sort by ["duration", "price"]. Instead, using the package _hpp_ it cleans the request parameters and only sorts by the last one.

This behavior is not always needed, e.g. cases like price of 5 **and** 9, therefore a parameter whitelist is required.
