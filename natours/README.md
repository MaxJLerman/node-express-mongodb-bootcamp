# Natours + MongoDB

This README includes how to run MongoDB Shell & MongoDB Server for a local database connection.

## Installing MongoDB Shell & Server

Install MongoDB Shell from [here](https://www.mongodb.com/try/download/shell).

The default location for MongoDB Shell is usually: C:\Users\YOUR_USER\AppData\Local\Programs\mongosh\

Install MongoDB Server from [here](https://www.mongodb.com/try/download/community).

Make sure to install MongoDB Compass too in the Server installation process.

## Running MongoDB Shell

Navigate to the drive where MongoDB was installed. In my case, its Local Disk C.

Create a new folder called "data"

```
USER@DESKTOP MINGW64 /c
$ mkdir data
```

Inside the "data" folder, create a new folder called "db"

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
$ ./mongod.exe
```

As the server starts up, you should see that it is listening on port `27017`.
