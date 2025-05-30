# 🧺 Laundry Adda

<p>
    <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="java"/>
    <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="spring boot"/>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="react"/>
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgres"/>
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="docker"/>
    <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="tailwindcss"/>
    <img src="https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="material ui"/>
    <img src="https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white " alt="ant design"/>
    <img src="https://img.shields.io/badge/WebSockets-0078D4?style=for-the-badge&logo=websocket&logoColor=white" alt="websockets"/>
    <img src="https://img.shields.io/badge/REST%20API-02569B?style=for-the-badge&logo=api&logoColor=white" alt="rest api"/>
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="jwt"/>
    <img src="https://img.shields.io/badge/CICD-005571?style=for-the-badge&logo=githubactions&logoColor=white" alt="ci-cd"/>
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="git"/>
    <img src="https://img.shields.io/badge/Apache%20POI-EBB44B?style=for-the-badge&logo=apache&logoColor=black" alt="apache poi"/>
    <img src="https://img.shields.io/badge/Lombok-4B8BBE?style=for-the-badge&logo=java&logoColor=white" alt="lombok"/>
    <img src="https://img.shields.io/badge/Spring%20Data%20JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white" alt="jpa"/>
    <img src="https://img.shields.io/badge/Google%20Maps%20API-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="google maps api"/>
    <img src="https://img.shields.io/badge/Brevo%20(Sendinblue)-0078D4?style=for-the-badge&logo=sendinblue&logoColor=white" alt="brevo"/>
    <img src="https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" alt="maven"/>
</p>

---

## 🚀 Project Overview

**Laundry Adda** is a **full-cycle laundry pickup and delivery management platform** that seamlessly connects **customers**, **laundry owners**, **delivery personnel**, and **administrators** through an automated, scalable system.

Key features include real-time order tracking, zone-based delivery assignment, digital billing, feedback capture, and notifications.

---

## 🏗️ System Architecture

* **Architecture:** Monolithic
* **Backend:** Java + Spring Boot
* **Frontend:** React
* **Database:** PostgreSQL
* **Image Storage:** Local Backend Server
* **Authentication:** JWT-based RBAC
* **Notifications:** SMTP (Brevo)

---

## ✨ Key Features

* ✅ **Customer order placement with geolocation**
  Easily place laundry pickup requests using automatic or manual location detection.

* ✅ **Laundry owner service management**
  Owners can manage services, pricing, and orders in real time.

* ✅ **Delivery personnel pickup & delivery tracking**
  Track the entire pickup-to-delivery process with live updates.

* ✅ **Itemized billing with in-app updates**
  Generate detailed item-wise bills with photos and remarks.

* ✅ **Integrated payment gateway (Razorpay)**
  Secure online payments with automatic reconciliation.

* ✅ **Automatic settlements to laundry owners**
  Timely payouts and settlements handled automatically.

* ✅ **Feedback & rating system**
  Customers can rate services and provide feedback.

* ✅ **Automated email, SMS & push notifications**
  Stay updated at every step through multi-channel notifications.

* ✅ **Admin dashboard for full system control**
  Admins can monitor, manage, and oversee the entire platform.

* ✅ **Role-based access and permissions**
  Fine-grained RBAC for customers, owners, delivery, and admins.

---

## 🛠️ Tech Stack

| Layer          | Tools / Frameworks                      |
|----------------|-----------------------------------------|
| **Frontend**   | React, HTML, CSS, JavaScript, Tailwind  |
| **Backend**    | Java, Spring Boot, REST APIs            |
| **Database**   | PostgreSQL                              |
| **DevOps**     | Docker, GitHub Actions (optional CI/CD) |
| **Messaging**  | SMTP, Twilio                            |
| **Storage**    | Local Backend Server                    |
| **Security**   | JWT, RBAC, Password Hashing (BCrypt)    |

---

## 🗺️ System Flow Summary

### 1️⃣ Customer Places Pickup Request

* Selects services, time slot, nearby laundry
* Order saved as **PENDING**
* Notifications sent to a laundry owner, admin

### 2️⃣ Laundry Owner Accepts/Rejects

* Owner reviews request, updates status
* If accepted → auto-assigns delivery
* Notifies customer and admin

### 3️⃣ Delivery Team Picks Up

* Marks pickup as **PICKED\_UP** after verifying the system generated secret key
* Notifies customer, laundry owner

### 4️⃣ Laundry Owner Processes Clothes

* Updates items in the app, then a system generates the invoice 
* Marks **READY\_FOR\_DELIVERY**
* Notifies customer

### 5️⃣ Final Delivery

* Delivery team marks as **DELIVERED**
* Feedback option triggered

### 6️⃣ Feedback Collection

* Customer rates and reviews service
* Feedback saved and shared with admin, an owner

---

## 🗃️ Database Design (Simplified)

| Entity                 | Fields & Relationships                                              |
|------------------------|---------------------------------------------------------------------|
| **User**               | id, name, email, password, role (CUSTOMER, OWNER, DELIVERY, ADMIN)  |
| **LaundryService**     | id, name, price, description, owner\_id                             |
| **PickupRequest**      | id, customer\_id, laundry\_id, time\_slot, status, created\_at      |
| **PickupServiceMap**   | id, pickup\_request\_id, service\_id                                |
| **DeliveryAssignment** | id, pickup\_request\_id, delivery\_person\_id, photo\_url, weight   |
| **PickupItem**         | id, pickup\_request\_id, item\_name, quantity, image\_url, remark   |
| **Feedback**           | id, pickup\_request\_id, customer\_id, rating, review, created\_at  |
| **Notification**       | id, user\_id, message, type, is\_read, created\_at                  |

---

## 💻 Getting Started

### Prerequisites

✅ Java 17+
✅ Maven / Gradle
✅ Node.js 16+
✅ MySQL or PostgreSQL running
✅ Docker (optional for containerized run)

---

### Backend Setup

```bash
    git clone https://github.com/DhruvGupta130/LaundryAddaApp.git
    cd LaundryAddaApp/backend
    ./mvnw clean install
    java -jar target/laundry-adda.jar
```

* Update `application.properties` with your DB credentials.
* To enable email/SMS, configure SMTP/Twilio keys.

---

### Frontend Setup

```bash
    cd LaundryAddaApp/frontend
    npm install
    npm start
```

* React admin and delivery dashboards.
* Customer portal runs separately (static HTML/CSS/JS).

---

### Docker (Optional)

```bash
  docker-compose up --build
```

This spins up:

* Spring Boot backend
* React frontend
* MySQL / PostgreSQL
* Brevo (for email notifications)

---

## 🧪 Usage

* Access portals:

    * **Customer** → `/pickup`
    * **Laundry Owner** → `/laundry`
    * **Delivery** → `/delivery`
    * **Admin** → `/admin`

* API Base: `/api`

---

## 🔒 Security Highlights

* JWT Authentication
* Role-Based Access Control (RBAC)
* Input validation, error handling
* Secure image and files storage

---

## 📦 DevOps & Deployment

* Containerized with Docker
* CI/CD pipelines (GitHub Actions or Docker)
* Deployed on VPS/AWS (EC2, S3, RDS)

---

## 📈 Future Improvements

* Shift to microservices architecture
* Add apache kafka for asynchronous notifications
* Use Redis for decentralized caching 
* Build a mobile app (React Native or Kotlin)

---

## 📧 Contact

For any inquiries or feedback, please reach out to [Dhruv Gupta](mailto:dhruvgupta130@gmail.com) or connect on [LinkedIn](https://www.linkedin.com/in/dhruvgupta130).

---
