require('dotenv').config();
const express = require("express");
const path = require('path');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const UserRouter = require("./routes/user");
const AuthRouter = require("./routes/auth");
const AlertRouter = require('./routes/alert');
const CategoryRouter = require("./routes/category");
const ProductRouter = require("./routes/product");
const AlertTypeRouter = require('./routes/alertType');
const CategoryProductRouter = require('./routes/categoryProduct');
const CartRouter = require('./routes/cart');
const OrderRouter = require('./routes/order');
const NewsletterRouter = require('./routes/newsletter');
const StockRouter = require('./routes/stock');
const UserHistoryRouter = require('./routes/userHistory');
const PasswordHistoryRouter = require('./routes/passwordHistory');
const ProductPromotionRouter = require('./routes/productPromotion');
const PromotionRouter = require('./routes/promotionCode');
const cors = require("cors");
const nodemailer = require('nodemailer');
const app = express();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});


app.use((req, res, next) => {
    req.transporter = transporter;
    next();
});


app.use(session({
    secret: 'challenge4IWS2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(cors());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/users", UserRouter);
app.use("/auth", AuthRouter);
app.use("/category", CategoryRouter);
app.use('/alert', AlertRouter);
app.use('/product', ProductRouter);
app.use('/alert_types', AlertTypeRouter);
app.use('/category_product', CategoryProductRouter);
app.use('/cart', CartRouter);
app.use('/order', OrderRouter);
app.use('/newsletter', NewsletterRouter);
app.use('/stock', StockRouter);
app.use('/user_history', UserHistoryRouter);
app.use('/password_history', PasswordHistoryRouter);
app.use('/product_promotion', ProductPromotionRouter);
app.use('/promotion_code', PromotionRouter);


app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
