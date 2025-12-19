### **High-Level System Architecture Explaination**

**Purpose**  
 Provide a clear, end-to-end view of the Karigar platform, showing how users, services, and infrastructure components interact at a high level. This diagram should help reviewers quickly understand system boundaries, responsibilities, and data flow.

---

#### **Core Components**

##### **1\. Frontend (Next.js)**

* Web application used by **Customers**, **Service Providers**, and **Admin**

* Responsibilities:

  * UI rendering and client-side interactions

  * Authentication flows (login, signup, role-based routing)

  * Calling backend APIs

  * Handling client-side state and validations

* Served via CDN for fast global access

---

##### **2\. Backend API (Go \+ Gin)**

* Central application server exposing REST APIs

* Responsibilities:

  * Business logic (service requests, bookings, availability checks)

  * Role-based access control (Customer / Provider / Admin)

  * Validation and authorization

  * Orchestrating interactions with database and external services

* Stateless to allow horizontal scaling

---

##### **3\. Database (Supabase / PostgreSQL)**

* Primary persistent data store

* Stores:

  * Users and roles

  * Service provider profiles

  * Services, pricing, availability slots

  * Service requests and booking states

  * Reviews and ratings

* Enforces data integrity via constraints and transactions

---

##### **4\. External Services**

* **Payment Gateway** (future / optional)

  * Handles online payments, refunds, and transaction status

* **SMS Service**

  * Booking confirmations, reminders, OTPs

* **Email Service**

  * Account notifications, booking updates, admin alerts

---

##### **5\. CDN & Static Assets**

* Hosts static assets (images, icons, JS bundles)

* Reduces load on frontend servers

* Improves latency for users in different regions

---

##### **6\. Load Balancer**

* Distributes incoming traffic across multiple backend instances

* Improves reliability and fault tolerance

* Enables horizontal scaling as user traffic grows

---

##### **7\. API Gateway (Future Scope)**

* Single entry point for all backend services

* Responsibilities (when introduced):

  * Rate limiting

  * Request authentication

  * Logging and monitoring

  * Versioning of APIs

* Prepares the system for microservices architecture

---

#### **High-Level Data Flow (Textual)**

1. User accesses Karigar via browser → **Next.js Frontend (CDN)**

2. Frontend sends requests → **Load Balancer**

3. Load Balancer routes → **Go/Gin Backend API**

4. Backend:

   * Reads/Writes data → **PostgreSQL (Supabase)**

   * Triggers notifications → **SMS / Email Services**

   * (Optional) Initiates payments → **Payment Gateway**

5. Response flows back to the Frontend

---

#### **Diagram Tool Recommendation**

* **Draw.io**

  * Use layered grouping:

    * Client Layer

    * Application Layer

    * Data Layer

    * External Services

  * Keep arrows directional and labeled (e.g., HTTPS, REST, Webhooks)

