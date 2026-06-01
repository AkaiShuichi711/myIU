const fetchManager = require('./utils/fetchManager');

const isConfigured = (req) => {
    
    if (req.app.locals.appSettings.credentials.clientId != 'REPLACE-WITH-YOUR-APP-CLIENT-ID' &&
        req.app.locals.appSettings.credentials.tenantId != 'REPLACE-WITH-YOUR-APP-TENANT-ID' &&
        req.app.locals.appSettings.credentials.clientSecret != 'REPLACE-WITH-YOUR-APP-CLIENT-ID-SECRET') {
        console.log("appSettings is configured")
        return true;
    } else {
        console.log("appSettings is NOT configured")
        return false;
    }
}

// ========== JSON API Endpoints for Frontend ==========

exports.apiGetUser = (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const claims = req.session.idTokenClaims || {};
    res.json({
        id: claims.oid || claims.sub,
        name: claims.name,
        username: claims.preferred_username,
        email: claims.email,
    });
}

exports.apiGetProfile = async(req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Ensure graphAPI token is available
        if (!req.session["graphAPI"] || !req.session["graphAPI"].accessToken) {
            return res.status(400).json({ error: 'No access token for Graph API' });
        }

        const claims = req.session.idTokenClaims || {};
        const profile = await fetchManager.callAPI(req.app.locals.appSettings.resources.graphAPI.endpoint, req.session["graphAPI"].accessToken);
        if (profile && profile.error) {
            return res.status(500).json({ error: profile.error });
        }

        const roles = profile?.roles || claims.roles || [];
        const groups = profile?.groups || claims.groups || [];

        const profileData = {
            displayName: profile?.displayName || claims.name || null,
            givenName: profile?.givenName || claims.given_name || null,
            surname: profile?.surname || claims.family_name || null,
            userPrincipalName: profile?.userPrincipalName || claims.preferred_username || null,
            mail: profile?.mail || claims.email || claims.preferred_username || null,
            jobTitle: profile?.jobTitle || null,
            officeLocation: profile?.officeLocation || null,
            roles: Array.isArray(roles) ? roles : [roles].filter(Boolean),
            groups: Array.isArray(groups) ? groups : [groups].filter(Boolean),
            raw: profile,
        };

        res.json(profileData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

exports.apiGetTenant = async(req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const claims = req.session.idTokenClaims || {};
        const tenantInfo = {
            tenantId: claims.tid || null,
            objectId: claims.oid || null,
            clientId: claims.aud || null,
            name: claims.name || null,
            displayName: claims.name || null,
            username: claims.preferred_username || null,
            email: claims.email || claims.preferred_username || null,
            issuer: claims.iss || null,
            idTokenClaims: claims,
        };

        if (req.session["graphAPI"] && req.session["graphAPI"].accessToken) {
            try {
                const profile = await fetchManager.callAPI(req.app.locals.appSettings.resources.graphAPI.endpoint, req.session["graphAPI"].accessToken);
                tenantInfo.graphProfile = profile;
            } catch (profileError) {
                console.log('Graph profile fetch failed for tenant info:', profileError);
            }
        }

        if (req.session["armAPI"] && req.session["armAPI"].accessToken) {
            try {
                const armTenant = await fetchManager.callAPI(req.app.locals.appSettings.resources.armAPI.endpoint, req.session["armAPI"].accessToken);
                tenantInfo.armTenant = armTenant;
            } catch (armError) {
                console.log('ARM tenant fetch failed:', armError);
            }
        }

        res.json(tenantInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};
