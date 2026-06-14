# Admin Panel

Admin dashboard and management interface for Rehoboth Health & Wellness Clinic.

## 📋 Overview

Secure admin panel for managing appointments, contact messages, and newsletter subscribers. Built with Material-UI for a consistent, responsive experience.

## 🚀 Access

Access the admin panel at `/admin` routes:
- Dashboard: `/admin`
- Appointments: `/admin/appointments`
- Calendar: `/admin/calendar`
- Blocked Time Slots: `/admin/blocked-time-slots`
- Contact Messages: `/admin/contact-messages`
- Subscribers: `/admin/subscribers`
- Payments: `/admin/payments`
- Vouchers: `/admin/vouchers`
- Reviews: `/admin/reviews`
- Users: `/admin/users`
- Blog: `/admin/blog`
- Team: `/admin/team`
- Services: `/admin/services`

## 📁 Structure

```
admin/
├── components/        # Reusable admin components
│   ├── AdminSidebar.jsx    # Collapsible sidebar navigation
│   └── DataTable.jsx       # Reusable data table with filters
├── layout/            # Layout components
│   └── AdminLayout.jsx     # Main admin layout wrapper
└── pages/            # Admin page components
    ├── AdminDashboard.jsx      # Dashboard overview
    ├── AppointmentsPage.jsx    # Appointments management
    ├── ContactMessagesPage.jsx # Contact messages
    └── SubscribersPage.jsx    # Newsletter subscribers
```

## 🎯 Features

### Dashboard (`AdminDashboard.jsx`)

At-a-glance overview fetched in one parallel `Promise.allSettled` batch:

**Appointments section (4 stat cards)**
- Today's Appointments, Upcoming, Total Appointments, Pending Payment (7 days)

**Payments section (4 stat cards)**
- Total Payments, Pending (with £ amount), Verified (with £ amount), Refunded
- Stats computed from appointments data — no extra API call

**Overview section (5 stat cards)**
- Contact Messages, Newsletter Subscribers, Pending Reviews, Registered Users, Total Vouchers
- `VoucherStatsCard` receives vouchers as props from the parent — no duplicate fetch

**Quick Actions row** — Appointments, Calendar, Blocked Slots, New Voucher, Payments, Pending Reviews

**Needs Attention strip** — shown when unread notifications, pending reviews, or pending payments exist

**Charts** — Monthly Bookings, Service Donut, Subscribers Donut (all use loaded data; show Skeleton while loading)

**Tables** — Top 5 Upcoming Appointments, Recent Contact Messages, Recent Vouchers, Recent Voucher Issuances

**UX**
- Refresh button re-runs `fetchDashboardData`
- MUI `Alert` shown when any critical endpoint fails (appointments, messages)
- All stat cards render immediately with `loading` spinner — no layout shift on load
- Chart and table cells show `Skeleton`/`CircularProgress` while data loads

### Appointments Management (`AppointmentsPage.jsx`)

View and manage all appointments:
- Numbered rows for easy reference
- Search and filter functionality
- Pagination support
- Displays: Name, Email, Phone, Service, Date, Time, Status
- Refresh button to reload data

### Contact Messages (`ContactMessagesPage.jsx`)

View all contact form submissions:
- Numbered rows
- Search by name, email
- Displays: First Name, Last Name, Email, Phone, Message, Date
- Clickable email links
- Message preview with ellipsis

### Newsletter Subscribers (`SubscribersPage.jsx`)

Manage newsletter subscribers:
- Numbered rows
- Search by email
- Displays: Email, Subscribed Date, Status
- Email icon indicators
- Active status chips

## 🧩 Components

### AdminSidebar

Collapsible sidebar navigation:
- **Desktop**: Persistent sidebar, toggles width (260px ↔ 80px)
- **Mobile**: Temporary drawer, toggles visibility
- Icons remain visible when collapsed
- Active route highlighting
- Smooth transitions

### DataTable

Reusable table component with:
- **Search**: Filter rows by search term
- **Pagination**: Configurable rows per page
- **Sorting**: Click column headers to sort
- **Custom Rendering**: Render functions for columns
- **Responsive**: Mobile-friendly design
- **Loading States**: Spinner during data fetch

### AdminLayout

Main layout wrapper:
- Sidebar integration
- Content area with proper spacing
- Mobile menu button
- Responsive layout adjustments

## 🎨 Design Features

### Color Scheme

- Primary: `#47672f` (Green)
- Secondary: `#f58c00` (Orange)
- Background: Light gray/white
- Text: Dark gray/black

### Responsive Design

- **Mobile**: Full-width sidebar drawer
- **Tablet**: Collapsible sidebar
- **Desktop**: Persistent sidebar with width toggle

### Typography

- Headings: Bold, 500-600 weight
- Body: Regular, 400 weight
- Consistent font sizes across breakpoints

## 📊 Data Tables

### Table Features

All tables include:
- Row numbering (No. column)
- Search functionality
- Pagination (10 rows per page default)
- Column sorting
- Custom cell rendering
- Responsive scroll containers

### Table Styling

- Small scrollbars (6px width)
- Default scrollbar colors
- Hover effects on rows
- Alternating row colors (optional)

## 🔌 API Integration

All admin pages fetch data from backend:

```javascript
// Appointments
GET /api/appointments

// Contact Messages
GET /api/contact/messages

// Subscribers
GET /api/newsletter/subscribers
```

### Error Handling

- Loading spinners during fetch
- Error alerts on failure
- Empty state messages
- Refresh buttons for retry

## 🛠️ Usage Examples

### Adding a New Admin Page

1. Create page component in `pages/`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/admin/new-page" element={<NewPage />} />
   ```
3. Add navigation item in `AdminSidebar.jsx`
4. Use `DataTable` component for data display

### Customizing DataTable

```jsx
<DataTable
  columns={[
    {
      id: "name",
      label: "Name",
      render: (value) => <Typography>{value}</Typography>
    }
  ]}
  rows={data}
  loading={loading}
  searchPlaceholder="Search..."
/>
```

## 📱 Mobile Considerations

- Sidebar becomes drawer on mobile
- Tables scroll horizontally
- Touch-friendly buttons
- Responsive typography
- Optimized spacing

## 🔒 Security Notes

- Admin routes should be protected (add authentication)
- API endpoints should verify admin access
- Sensitive data should be masked if needed

## 🐛 Troubleshooting

### Sidebar Not Collapsing

- Check `AdminSidebar.jsx` state management
- Verify `AdminLayout.jsx` integration
- Check for CSS conflicts

### Data Not Loading

- Verify API endpoints
- Check network requests in browser console
- Verify backend is running
- Check CORS configuration

### Table Not Responsive

- Verify `DataTable` scroll container
- Check column widths
- Test on different screen sizes

## 📚 Related Documentation

- [Components README](../components/README.md)
- [Frontend README](../../README.md)
- [Backend README](../../../server/README.md)

---

**For component details, see [../components/README.md](../components/README.md)**

