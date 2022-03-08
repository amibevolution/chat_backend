const path = require( "path" );
const MongoClient = require( "mongodb" ).MongoClient;
const bodyParser = require( "body-parser" );
const express = require( "express" );
const app = express();

app.use( bodyParser.json() );
app.use(
  bodyParser.urlencoded( {
    extended: true
  } )
);

const port = 3000;

const uri =
  "mongodb+srv://ami_b:Evolution123@cluster0.hzbsd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient( uri );

app.get( "/", ( req, res ) => {
  res.sendFile( path.join( __dirname, "response.html" ) );
} );

app.post( "/login", ( req, res ) => {
  let myObj = {
    email: req.body.email,
    password: req.body.password
  };
  console.log( myObj );
  client.connect( async ( err, db ) => {
    if ( err ) {
      console.log( "cannot connect db" + err );
      return;
    }
    console.log( "DataBase connection made successfully" );
    const collection = db.db( "user_data" ).collection( "user_data" );

    collection.insertOne( myObj, async ( err, r ) => {

      client.close();
      if ( err ) {
        console.log( "cannot add obj", err );
        return;
      }

      console.log( "Added a user" );
      res.redirect( "/" );
    } );
  } );
} );
app.listen( port, () => {
  console.log( `Server Runing On Port ${port}` );
} );
