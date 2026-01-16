# How to Add Admin Database Management Page to Admin Dashboard

## The Component is Created
The component file exists at: `src/pages/AdminDatabaseManagement.jsx`

## Steps to Add to Admin Dashboard

### Option 1: If using React Router

1. **Find your admin routes file** (usually in `App.jsx`, `App.js`, or a routes file)

2. **Import the component:**
```jsx
import AdminDatabaseManagement from './pages/AdminDatabaseManagement';
```

3. **Add the route:**
```jsx
<Route 
  path="/admin/database" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDatabaseManagement />
    </ProtectedRoute>
  } 
/>
```

### Option 2: If using a sidebar/navigation menu

Add a menu item to your admin navigation:

```jsx
{
  name: "Database Management",
  path: "/admin/database",
  icon: "🗄️" // or your icon component
}
```

### Option 3: Direct Link

Add a link/button in your admin dashboard:

```jsx
<Link to="/admin/database">
  <button>Database Management</button>
</Link>
```

## API Endpoints Available

- `GET /api/admin/database/stats` - Get database statistics
- `POST /api/admin/database/delete-all` - Delete all data (requires confirmation)

## Testing

1. Make sure backend server is running
2. Navigate to `/admin/database` in your browser
3. You should see the database statistics dashboard

