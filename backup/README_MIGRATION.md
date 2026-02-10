# Microsoft Authentication Frontend

This is a React frontend application that integrates Microsoft Authentication using MSAL (Microsoft Authentication Library).

## Features

- Microsoft Azure AD Authentication
- ID Token Claims Display
- Microsoft Graph API Integration (Profile Data)
- Azure Resource Manager API Integration (Tenant Data)
- Protected Routes
- Modern UI with Tailwind CSS and shadcn/ui

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Azure AD App Registration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# Microsoft Authentication Configuration
VITE_AD_CLIENT_ID=your_client_id_here
VITE_AD_TENANT_ID=your_tenant_id_here
VITE_REDIRECT_URI=http://localhost:5173
```

### Azure AD Configuration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Your app name (e.g., "MyIU Frontend")
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: `http://localhost:5173` (for development)
5. After creation, note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### Environment Variables

Update your `.env` file with the actual values:

```env
# Microsoft Authentication Configuration
VITE_AD_CLIENT_ID=12345678-1234-1234-1234-123456789012
VITE_AD_TENANT_ID=87654321-4321-4321-4321-210987654321
VITE_REDIRECT_URI=http://localhost:5173
```

### API Permissions

In your Azure AD app registration, go to **API permissions** and add:

1. **Microsoft Graph** > **User.Read** (Delegated)
2. **Azure Resource Manager** > **user_impersonation** (Delegated) - for tenant info

**Important**: For tenant information to work, you need admin consent for the Azure Resource Manager permissions.

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# Microsoft Authentication Configuration
VITE_AD_CLIENT_ID=your_client_id_here
VITE_AD_TENANT_ID=your_tenant_id_here
VITE_REDIRECT_URI=http://localhost:5173

# Legacy Appwrite (can be removed if not needed)
VITE_APPWRITE_URL=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_id
VITE_APPWRITE_USER_COLLECTION_ID=users
VITE_APPWRITE_POST_COLLECTION_ID=posts
VITE_APPWRITE_SAVES_COLLECTION_ID=saves
```

### Installation

```bash
cd frontend
npm install
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port).

## Routes

- `/` - Home page (redirects to `/home`)
- `/home` - Main dashboard with authentication status
- `/sign-in` - Microsoft login page
- `/sign-up` - Sign up page (shows info about Azure AD management)
- `/id` - Display ID token claims
- `/profile` - Display Microsoft Graph profile data
- `/tenant` - Display Azure tenant information (requires admin permissions)

## API Permissions

For full functionality, ensure your Azure AD app has the following permissions:

### Microsoft Graph

- `User.Read` - Read user profile

### Azure Resource Manager

- `user_impersonation` - Access Azure Resource Manager

## Architecture

The application uses:

- **MSAL Browser**: For client-side authentication
- **MSAL React**: React hooks and components for MSAL
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **TypeScript**: Type safety

## Migration from Server

This frontend was migrated from the `js-e2e-web-app-server-auth` Express.js server, bringing the same authentication functionality to a modern React SPA.

Key changes:

- Replaced Express sessions with MSAL token caching
- Converted EJS templates to React components
- Maintained the same API integrations (Graph API, ARM API)
- Added modern UI/UX with responsive design
