import express, { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import validator from 'validator';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  //filter image endpoint
  app.get('/filteredimage', async (req: Request, res: Response, next) => {
    const imageUrl = req.query.image_url
    if (!imageUrl) {
      return res.status(400).send({"message": "No URL was specified in the query string"})
    }
    if (!validator.isURL(imageUrl, {allow_underscores: true})) {
      return res.status(400).send({"message": "Invalid URL"})
    }
    const authorizedExtensions = ['jpg', 'jpeg', 'svg', 'png', 'bmp', 'gif']
    if (!authorizedExtensions.includes(imageUrl.split('.')[imageUrl.split('.').length - 1])) {
      return res.status(400).send({"message": "Not an image or extension missing"})
    }
    const imagePath = await filterImageFromURL(imageUrl)
    res.status(200).sendFile(imagePath, {}, (err: Error) => {
      if (err) {
        next(err)
      } else {
        deleteLocalFiles([imagePath])
      }
    })
  })

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
