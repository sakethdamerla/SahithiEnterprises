# Sahithi Enterprises - Product Catalog & Admin Portal

A modern, responsive Product Catalog and Administrative Dashboard built for **Sahithi Enterprises**. This application provides a seamless experience for customers to browse products and offers, while empowering administrators with robust tools for inventory and user management.

## 🚀 Features

### for Customers
*   **Responsive Design**: Optimized for all devices (Mobile, Tablet, Desktop) with a premium UI feel.
*   **Product Catalog**: Browse products by categories (Electronics, Tyres, Power, etc.) with sorting and filtering.
*   **Announcements**: Stay updated with the latest offers and news via a dedicated announcements section.
*   **Smart Search**: Instantly find products or categories.
*   **PWA Support**: Installable on mobile devices (iOS/Android) for a native-app-like experience.

### for Administrators
*   **Secure Dashboard**: Role-based access control (Superadmin & Admin roles).
*   **Product Management**: Create, edit, delete, and manage stock status of products.
*   **Analytics Dashboard**: Visual insights into site traffic and user interests.
*   **Announcement Manager**: Post and manage public announcements.
*   **User Management (Superadmin)**: Create new admins and manage granular permissions (e.g., restrict access to specific modules).

## 🛠️ Technology Stack

*   **Frontend**: [React.js](https://reactjs.org/) (v18) with Vite
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for modern, utility-first design.
*   **Routing**: React Router v6
*   **Charts**: Recharts for analytics visualization.
*   **State Management**: React Context API (AuthContext, ProductsContext).
*   **Icons**: Heroicons & specialized SVG assets.

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/sahithi-enterprises.git
    cd sahithi-enterprises/frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 🔐 Admin Access

This demo utilizes client-side authentication persistence (mock).

*   **Login URL**: `/admin/login`
*   **Superadmin Credentials**: (Check `AuthContext.jsx` or ask your administrator)

## 📱 Mobile Responsiveness

The application is fully responsive:
*   **Navigation**: Collapsible mobile menu with simplified navigation.
*   **Grids**: Adaptive product grids (2 columns on mobile, up to 4 on desktop).
*   **Tables**: Admin data tables switch to card-based views on smaller screens for better readability.

## 🤝 Contribution

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes.
4.  Push to the branch and open a Pull Request.

---
© 2026 Sahithi Enterprises. All rights reserved.
