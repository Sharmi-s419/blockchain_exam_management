<img width="1670" height="772" alt="Screenshot 2026-05-20 065306" src="https://github.com/user-attachments/assets/210f156b-bfac-4bd6-ac74-7168e2ac3a40" />
<img width="1012" height="747" alt="Screenshot 2026-05-20 065120" src="https://github.com/user-attachments/assets/07329df3-a9f2-45a0-bf15-b88fa1e2b01c" />
<img width="1012" height="747" alt="Screenshot 2026-05-20 065120" src="https://github.com/user-attachments/assets/29f232a3-4e32-4054-95f8-9ebf54cde9d3" />
Blockchain-Based Online Exam Management System

The Blockchain-Based Online Exam Management System is a secure and automated web application developed using React, Django, and Ethereum technology to conduct online examinations efficiently while ensuring transparency, security, and data integrity through blockchain integration.

The system provides two major modules: Admin Module and User Module.

The Admin Module allows administrators to manage the entire examination process. Admins can create exams, schedule exam dates and timings, upload question papers in PDF format or create objective-type questions directly through the system, and monitor student registrations. The admin dashboard provides detailed insights such as the total number of users, registered candidates, exam schedules, attendance records, and submitted answer sheets. The system also supports automatic evaluation for objective-type questions and enables admins to publish results either automatically or manually.

The User Module allows students to register on the platform and securely log in using their credentials. Users can view available exams, register for examinations, attend exams during the permitted time slot, answer objective questions, or upload subjective answer sheets. The application implements strict timing control where the question paper becomes accessible only during the scheduled exam duration. Before the exam start time, the system displays an “Exam Not Started” message, and after the exam end time, access is automatically restricted.

A major feature of the system is the integration of blockchain technology. After exam evaluation, the results are securely stored on the blockchain using smart contracts. This ensures that examination results cannot be modified or tampered with, thereby improving trust, transparency, and security. Each result is associated with a blockchain transaction hash that can be used for verification purposes.

The frontend of the application is developed using React.js to provide a responsive and interactive user interface, while the backend is built using Django REST Framework for API development and business logic handling. Blockchain integration is implemented using Ethereum, Ganache, Solidity smart contracts, and Web3 technologies.

The project aims to modernize the traditional online examination process by combining automation, secure authentication, real-time exam monitoring, automatic result generation, and blockchain-based result validation into a single reliable platform.
