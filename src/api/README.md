# API Client

API client utilities for making HTTP requests to the backend.

## 📋 Overview

Centralized API client using Axios for all backend communication. Provides consistent error handling and request formatting.

## 📁 Files

- `api.jsx` - Main API client with all endpoint functions

## 🔌 API Functions

### Appointments

#### `createAppointment(appointmentData)`
Creates a new appointment.

**Parameters:**
```javascript
{
  name: string,
  email: string,
  phone: string,
  service: string,
  date: string,
  time: string,
  message?: string
}
```

**Returns:** Promise with response data

#### `getAppointments()`
Gets all appointments (admin).

**Returns:** Promise with appointments array

#### `getAvailableDates()`
Gets available appointment dates.

**Returns:** Promise with available dates array

### Contact

#### `submitContactForm(contactData)`
Submits contact form.

**Parameters:**
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  message: string
}
```

**Returns:** Promise with response data

#### `getContactMessages()`
Gets all contact messages (admin).

**Returns:** Promise with messages array

### Newsletter

#### `subscribeNewsletter(email)`
Subscribes to newsletter.

**Parameters:**
```javascript
{
  email: string
}
```

**Returns:** Promise with response data

#### `getSubscribers()`
Gets all newsletter subscribers (admin).

**Returns:** Promise with subscribers array

## 🛠️ Usage

### Basic Usage

```javascript
import { createAppointment } from '../api/api';

const handleSubmit = async (data) => {
  try {
    const response = await createAppointment(data);
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### In Components

```javascript
import React, { useState } from 'react';
import { submitContactForm } from '../api/api';

function ContactForm() {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await submitContactForm(formData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (/* form JSX */);
}
```

## ⚙️ Configuration

### Base URL

API base URL is configured in `api.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, update to production API URL.

### Axios Configuration

- Default timeout
- Error handling
- Request/response interceptors (if needed)

## 🔒 Error Handling

All API functions handle errors:
- Network errors
- Server errors (4xx, 5xx)
- Timeout errors
- Validation errors

### Error Response Format

```javascript
{
  success: false,
  message: "Error message",
  errors?: {...} // Validation errors
}
```

## 📝 Response Format

### Success Response

```javascript
{
  success: true,
  data: {...} // Response data
}
```

### Error Response

```javascript
{
  success: false,
  message: "Error message"
}
```

## 🐛 Troubleshooting

### Network Errors

- Verify backend server is running
- Check API base URL
- Verify CORS configuration
- Check network connection

### CORS Errors

- Verify backend CORS settings
- Check request headers
- Verify API URL matches backend

### Timeout Errors

- Check network connection
- Verify server is responsive
- Increase timeout if needed

## 📚 Related Documentation

- [Backend README](../../../server/README.md)
- [Backend Routes README](../../../server/routes/README.md)
- [Axios Docs](https://axios-http.com/)

---

**For backend API details, see [../../../server/README.md](../../../server/README.md)**

