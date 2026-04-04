# NotaryPro - Advanced Notary Management System

NotaryPro is a comprehensive, multi-tenant SaaS application designed for modern notary institutions. It streamlines the entire notarization workflow, from client intake and document management to QR-based verification and automated billing.

## 🚀 Core Features

### 👤 Client Management
*   **Complete Profiles**: Register clients with personal details, contact information, and address.
*   **Identity Verification**: Upload and store digital copies of client ID documents (Passports, Driver's Licenses, etc.).
*   **Security First**: All identity records are stored securely with restricted access.

### 📄 Document Lifecycle
*   **Upload & Scan**: Easily upload scanned copies of physical documents.
*   **Digital Tracking**: Every document is assigned a unique **Tracking ID** that cannot be altered.
*   **Search Engine**: Instant search for previous notarizations by name, type, or date.
*   **Status Workflow**: Track documents through various stages—Draft, Pending, Notarized, or Rejected.

### 🛡️ Smart Verification (QR Code)
*   **Authenticity Seal**: Generate unique QR codes for every notarized document.
*   **Public Verification Page**: Recipients can scan the QR code to verify the document's authenticity on a public, tamper-proof landing page.
*   **Digital Audit**: Confirm issuing institution, date of notarization, and involved principals instantly.

### 💰 Billing & Invoicing
*   **Automated Receipts**: Generate professional invoices and receipts for every service.
*   **Print-Ready**: Professional layouts optimized for printing as physical receipts.
*   **Revenue Management**: Track paid and outstanding fees directly from the dashboard.

### 🕵️ Audit & Compliance
*   **User Roles**: Granular access control for **Super Admin**, **Tenant Admin**, **Notary**, **Staff**, and **Auditor**.
*   **Activity Logs**: Complete audit trail of every action in the system—who did what, and when.
*   **2FA Ready**: Security foundation for Two-Factor Authentication to prevent unauthorized access.

## 🛠️ Technical Stack

*   **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS 4.
*   **Icons & UI**: Lucide React, Glassmorphism design system.
*   **Backend**: Next.js API Routes (Edge compatible).
*   **Database**: PostgreSQL with **Prisma ORM**.
*   **Storage**: Local storage for uploads (S3 ready).
*   **Auth**: NextAuth.js / JWT.

## 📦 Getting Started

### Prerequisites
*   Node.js 20+
*   PostgreSQL Database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd notary-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-postgresql-url"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run database migrations:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

*   `/app`: Next.js App Router (Pages & API Routes).
*   `/components`: Reusable UI components (Layout, Modals, Forms).
*   `/lib`: Core utilities (Prisma client, Logger, Auth config).
*   `/prisma`: Database schema and migrations.
*   `/public`: Static assets and uploaded documents.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
