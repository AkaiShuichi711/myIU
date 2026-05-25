# Office 365 Login Setup Guide

## Overview
This guide explains how the Office 365/Microsoft authentication has been implemented in the myIU application using Azure AD (Microsoft Entra ID) with MSAL (Microsoft Authentication Library).

## Features Implemented
✅ Office 365 login via Microsoft Account
✅ Automatic user creation/sync in Appwrite database
✅ Profile information retrieval from Microsoft Graph API
✅ Token-based authentication
✅ Error handling and user feedback

## Architecture

### Components Modified
1. **SignInForm.tsx** - Added Office 365 login button and handler
2. **lib/appwrite/api.ts** - Added `signInWithMicrosoft()` function
3. **lib/msal/config.ts** - Updated scopes for Microsoft Graph API
4. **main.tsx** - MSAL provider already configured

### Flow
```
User clicks "Sign in with Microsoft"
         ↓
MSAL loginPopup() is triggered
         ↓
User authenticates with Office 365
         ↓
Access token + user info returned
         ↓
Microsoft Graph API called to get profile details
         ↓
User created/updated in Appwrite database
         ↓
Redirect to home page
```

## Environment Variables

The following environment variables must be set in `.env`:

```env
# Microsoft Authentication (Azure AD)
VITE_AD_CLIENT_ID=your-client-id-here
VITE_AD_TENANT_ID=your-tenant-id-here
VITE_REDIRECT_URI=http://localhost:5173  # or your production URL
```

### How to Get These Values

#### 1. Create Azure App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in the application name: "myIU"
5. Select "Single page application (SPA)"
6. Enter redirect URI: `http://localhost:5173` (for development)
7. Click "Register"

#### 2. Get Client ID & Tenant ID
- **Client ID (Application ID)**: Found on the App registration Overview page
- **Tenant ID (Directory ID)**: Also found on the Overview page

#### 3. Configure API Permissions
1. Go to "API permissions" in your app registration
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Delegated permissions"
5. Search and select:
   - `User.Read`
   - `profile`
   - `email`
6. Click "Add permissions"
7. Grant admin consent if needed

#### 4. Configure Redirect URI
1. In app registration, go to "Authentication"
2. Under "Single-page application", add redirect URI: `http://localhost:5173`
3. For production, also add your production URL
4. Ensure "Access tokens" and "ID tokens" are checked
5. Click "Save"

## Usage

### For Users
Simply click the "Sign in with Microsoft" button on the login page. You'll be redirected to authenticate with your Microsoft account.

### For Developers

#### Testing Office 365 Login
```javascript
// In SignInForm.tsx, the handler is already implemented:
const handleOffice365SignIn = async () => {
  // Triggers MSAL popup
  const response = await instance.loginPopup(loginRequest);
  // Gets user profile from Microsoft Graph
  // Creates/updates user in Appwrite
  // Redirects to home
}
```

#### Adding Office 365 to Other Components
```javascript
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msal/config";

const MyComponent = () => {
  const { instance } = useMsal();
  
  const handleLogin = async () => {
    const response = await instance.loginPopup(loginRequest);
    // Use response.accessToken and response.account
  };
  
  return <button onClick={handleLogin}>Login</button>;
};
```

## Database Structure

When a user logs in with Office 365, the following user record is created in Appwrite:

```json
{
  "accountId": "user-unique-id-from-azure",
  "name": "User Display Name",
  "email": "user@company.com",
  "username": "user.mail-nickname",
  "imageUrl": "avatar-initials-url",
  "bio": "",
  "authProvider": "microsoft"
}
```

## Error Handling

The application handles several error scenarios:

| Error | Handling |
|-------|----------|
| User cancels login | Shows "Sign in cancelled" toast |
| Network error | Shows error message with retry option |
| Token acquisition fails | Shows specific error details |
| User sync with Appwrite fails | Shows database error message |

## Security Considerations

✅ **Token Security**: Access tokens are kept in memory only, not stored in localStorage
✅ **HTTPS Required**: In production, MSAL requires HTTPS
✅ **Scope Limitation**: Only `User.Read`, `profile`, and `email` scopes are requested
✅ **PKCE Flow**: MSAL uses PKCE for enhanced security

## Troubleshooting

### "Redirect URI mismatch" Error
**Solution**: Ensure the redirect URI in your `.env` matches exactly with the URI registered in Azure Portal (including protocol and port)

### "Invalid client ID" Error
**Solution**: Verify `VITE_AD_CLIENT_ID` is correct and the application exists in Azure Portal

### "Insufficient permissions" Error
**Solution**: Check that the required Microsoft Graph permissions are granted in Azure Portal

### User Not Created in Database
**Possible causes**:
- Appwrite connection issue
- Database collection doesn't exist
- User collection ID incorrect in `.env`

**Solution**: Check browser console for detailed error messages

## Testing Checklist

- [ ] Can click "Sign in with Microsoft" button
- [ ] Microsoft login popup appears
- [ ] Can authenticate with test account
- [ ] User is created in Appwrite database
- [ ] Redirected to home page after successful login
- [ ] User profile data is correctly displayed
- [ ] Can logout and login again
- [ ] Error handling works for failed scenarios

## Next Steps (Optional Enhancements)

1. **Logout Integration**: Add Office 365 logout
   ```javascript
   const handleLogout = async () => {
     await instance.logout();
   };
   ```

2. **Silent Token Refresh**: Implement token refresh for seamless experience
   ```javascript
   const acquireTokenSilently = async () => {
     const result = await instance.acquireTokenSilent(loginRequest);
     return result.accessToken;
   };
   ```

3. **Multi-tenant Support**: Allow authentication from multiple Azure AD instances

4. **Conditional Access Policies**: Implement additional security checks based on device compliance

## Dependencies

- `@azure/msal-browser`: ^2.x
- `@azure/msal-react`: ^1.x
- `appwrite`: ^13.x

These should already be installed. To verify:
```bash
npm list @azure/msal-browser @azure/msal-react
```

## References

- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD Authentication Flows](https://learn.microsoft.com/en-us/azure/active-directory/develop/authentication-flows-app-scenarios)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/use-the-api)
- [Appwrite Documentation](https://appwrite.io/docs)

## Support

For issues related to:
- **Azure AD**: Check [Azure Portal](https://portal.azure.com)
- **MSAL**: See [MSAL Issues](https://github.com/AzureAD/microsoft-authentication-library-for-js/issues)
- **Appwrite**: Check [Appwrite Docs](https://appwrite.io/docs)
