# VENTTUP Tracking Software

## Overview
VENTTUP is a B2B marketplace application focusing on sustainable procurement and supply chain consulting. This web application tracks the status of orders and components across three main workflows: Supply Chain Distribution, Localization, and Contract Manufacturing.

## Deployment
Application is now live on https://venttup-client.vercel.app/.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file uploads)

### Setup
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd VENTTUP
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   ```

3. **Client Setup**
   ```bash
   cd client
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the `server` folder and add the following variables:
   ```env
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
   CLOUDINARY_KEY=<your_cloudinary_key>
   CLOUDINARY_SECRET=<your_cloudinary_secret>
   MONGODB_URI = <your_mongodb_uri>
   ```

5. **Run the Application**
   - Start the server:
     ```bash
     cd server
     npm start
     ```
   - Start the client:
     ```bash
     cd client
     npm start
     ```

## Usage
1. Navigate to `http://localhost:3000` to access the application.
2. Admins can upload orders, manage vendors, and track order statuses.
3. Vendors and customers can update and view order statuses.

## API Endpoints
- `POST /api/admin/uploadOrder`: Upload an order.
- `DELETE /api/admin/deleteItem`: Delete an item.
- Additional endpoints can be found in the server code.

## Contributing
Contributions are welcome! Please create a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
