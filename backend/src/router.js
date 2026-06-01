const getRoutes = (mainController, authProvider, router)=>{
    
    // health and API-only root route
    router.get('/', (req, res) => res.json({ status: 'ok', service: 'backend-api' }));

    // authentication routes
    router.get('/signin', authProvider.signIn);
    // New endpoint for frontend-initiated OAuth flow. Accepts `returnTo` query param.
    router.get('/auth/login', (req, res) => {
        const returnTo = req.query.returnTo;
        if (returnTo) req.session.returnTo = returnTo;
        return authProvider.signIn(req, res);
    });
    router.get('/signout', authProvider.signOut);
    router.get('/redirect', authProvider.handleRedirect);

    // ========== JSON API Endpoints for Frontend ==========
    router.get('/api/user', mainController.apiGetUser);
    router.get('/api/profile', authProvider.getToken, mainController.apiGetProfile);
    router.get('/api/tenant', mainController.apiGetTenant);

    // fallback 404 for backend API
    router.use((req, res) => res.status(404).json({ error: 'Not found' }));
    
    return router;
}

module.exports = getRoutes;