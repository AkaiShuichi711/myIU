/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const getRoutes = require('./router');
const mainController = require('./controller');
const cache = require('./utils/cachePlugin');
const app = express();

// get settings and set up Authentication into app
const appSettings = require('../appSettings')();
const msalWrapper = require('./msal-express-wrapper/auth-provider');
const authProvider = new msalWrapper.AuthProvider(appSettings, cache);
app.locals = {
    appSettings,
    authProvider,
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple inline CORS middleware (avoids external `cors` dependency)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', frontendOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        return res.sendStatus(200);
    }
    next();
});

/**
 * Using express-session middleware. Be sure to familiarize yourself with available options
 * and set the desired options. Visit: https://www.npmjs.com/package/express-session
 */
// Configure session cookie. For production, set secure:true and proper domain.
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'ENTER_YOUR_SECRET_HERE',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, sameSite: 'lax' },
    }),
);

// set up routes with authentication
app.use(getRoutes(mainController, authProvider, express.Router()));

app.listen(appSettings.host.port, () => console.log(`Msal Node Auth Code Sample app listening on port ${appSettings.host.port}!`));