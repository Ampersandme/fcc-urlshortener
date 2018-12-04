// my packages

var urlExists = require("url-exists");


module.exports = (app, db, ModelURL) => {
app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
  });
  
  // your first API endpoint...
  app.get("/api/hello", function(req, res) {
    res.json({ greeting: "hello API" });
  });
  
  // test API endpoint...
  app.get("/test", (req, res) => {
    console.log(req);
    res.json({ greeting: process.env.TESTTEST, url: "test" });
  });
  
  //Shortening URL's or taking the raw URL
  
  app.post("/api/shorturl/new", async (req, res, next) => {
    let rawURL = req.body.url;
    console.log(rawURL);
  
    // Regex taken from
    // https://github.com/Armandilho/URL-Shortener-Microservice/blob/master/server.js
  
    var testPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator)
  
    if (testPattern.test(rawURL) === true) {
      urlExists(rawURL, async function(err, works) {
        if (works === true) {
          const dbQuery = await ModelURL.find({ full_paste: rawURL });
          if (dbQuery.length !== 0) {
            const { url, short_url, full_paste } = dbQuery[0];
            res.json({ url, short_url, full_paste });
            console.log("Found it, it's already here!");
          } else {
            console.log("Didn't find it, We better add it now!");
  
            // getting the base name of the website
            const realName = rawURL.match(/(?<=\.)([a-z0-9])*/);
  
            const getAll = await ModelURL.find();
            const createURL = await ModelURL.create({
              url: realName[0],
              short_url: getAll.length + 1,
              full_paste: rawURL
            });
            const { url, short_url, full_paste } = createURL;
            res.json({ url, short_url, full_paste });
          }
        } else {
          console.log("URL does not exist!");
          res.json({ error: "URL does not exist" });
        }
      });
    } else {
      console.log("regex error!");
      res.json({ error: "internal error" });
    }
  });
  
  // Dedirecting to true URL from shortURL
  
  app.get("/api/shorturl/:shortNum", async (req, res) => {
    const { shortNum } = req.params;
    console.log(shortNum);
    const dbQuery = await ModelURL.find({ short_url: shortNum });
    console.log(dbQuery);
    console.log(typeof dbQuery.length);
    if (dbQuery.length === 1) {
      console.log("redirecting");
      const redirectURL = dbQuery[0].full_paste;
      console.log(redirectURL);
      res.redirect(redirectURL);
    } else {
      console.log("Not in database");
      res.json({ error: "This short URL has no true URL" });
    }
  });
}