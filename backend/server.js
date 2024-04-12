require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const UserRouter = require("./routes/user");
const SecurityRouter = require("./routes/security");
const app = express();
const cors = require("cors");
const nodemailer = require('nodemailer');

//function parseBody(req, res, next) {
//  const data = [];
//  req.on("data", (chunk) => {
//    data.push(chunk);
//  });
//  req.on("end", () => {
//    const buffer = Buffer.concat(data);
//    const body = buffer.toString();
//    try {
//      const bodyParsed = JSON.parse(body);
//      req.body = bodyParsed;
//      next();
//    } catch (e) {
//      return res.sendStatus(400);
//    }
//  });
//}


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Utilisez true si vous êtes sur le port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

app.use((req, res, next) => {
  req.transporter = transporter;
  next();
});
//app.use(parseBody);
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());

app.get("/", (req, res, next) => {
  res.send("Coucou " + JSON.stringify(req.query));
});

app.post("/", (req, res, next) => {
  res.send("Coucou FROM POST " + JSON.stringify(req.body));
});

app.use("/users", UserRouter);
app.use(SecurityRouter);
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
