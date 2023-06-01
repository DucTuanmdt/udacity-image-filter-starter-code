import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles, isValidUrl } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // filter image from url
  app.get(
    "/filteredimage",
    async (req: Request, res: Response, next: NextFunction) => {
      const url = req.query.img_url;

      if (!url) {
        res.status(400).send("img_url query is required");
      } else if (!isValidUrl(url)) {
        res.status(422).send("invalid url format");
      }

      try {
        const imgPath = await filterImageFromURL(url);

        res.status(200).sendFile(imgPath, (err) => {
          if (err) {
            next(err);
          } else {
            // delete temporary file
            deleteLocalFiles([imgPath]);
          }
        });
      } catch (err) {
        console.error("Can not handle image: ", err);
        res.status(500).send("Internal server error!");
      }
    }
  );

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (_req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
