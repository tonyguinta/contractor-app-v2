# Tasklist for testing contractor app features
_Exported on 6/20/2025 at 16:12:12 CDT from Cursor (1.1.3)_

---

**User**

Give me a tasklist of features to test. Put them in a logical sequence, following the typical workflow of a contractor using the app.

---

**Cursor**

I'll analyze the codebase to understand the app's features and create a logical test sequence based on a contractor's typical workflow.

Now let me examine the specific page components to understand the full feature set:

Based on my analysis of the codebase, I can now provide you with a comprehensive test task list that follows the typical workflow of a contractor using the app. Here's the testing sequence organized by the natural progression of how a contractor would use the system:

# Contractor App Testing Task List

## **Phase 1: Initial Setup & Authentication**
1. **User Registration**
   - Test new user registration with valid contractor details
   - Verify email validation and password requirements
   - Test registration with duplicate email (should fail)
   - Verify user profile creation with company information

2. **User Login**
   - Test login with valid credentials
   - Test login with invalid credentials (should fail)
   - Verify JWT token generation and storage
   - Test automatic redirect to dashboard after login

3. **Authentication Persistence**
   - Test page refresh maintains login state
   - Test navigation between pages while authenticated
   - Test logout functionality and token cleanup

## **Phase 2: Client Management**
4. **Add New Clients**
   - Test adding client with all required fields (name, email, phone)
   - Test adding client with optional fields (company, address, notes)
   - Verify client data validation and error handling
   - Test adding multiple clients

5. **View Client List**
   - Verify clients display correctly in grid layout
   - Test empty state when no clients exist
   - Verify client avatars and information display
   - Test responsive design on different screen sizes

6. **Client Data Management**
   - Test client information is properly associated with logged-in user
   - Verify clients from other users are not visible
   - Test client search/filtering (if implemented)

## **Phase 3: Project Management**
7. **Create New Projects**
   - Test creating project with client assignment
   - Test project with detailed cost breakdown (labor, materials, permits, other)
   - Verify project status options (planning, in_progress, completed, on_hold)
   - Test project with start/end dates
   - Test project description and title validation

8. **Project Cost Estimation**
   - Test estimated vs actual cost tracking
   - Verify cost calculations and totals
   - Test different cost categories (labor, materials, permits, other)
   - Test cost updates and tracking over time

9. **Project Status Management**
   - Test changing project status through workflow
   - Verify status color coding and display
   - Test project timeline and date management
   - Test project completion workflow

10. **Project-Client Relationships**
    - Verify projects are properly linked to clients
    - Test project display shows correct client information
    - Test filtering projects by client (if available)

## **Phase 4: Task Management** (Backend Model Exists)
11. **Task Creation and Assignment**
    - Test creating tasks within projects
    - Test task priority levels (low, medium, high)
    - Test task status workflow (pending, in_progress, completed)
    - Test task due dates and time tracking

12. **Task Time Tracking**
    - Test estimated vs actual hours tracking
    - Test task completion and timestamp recording
    - Verify task-project relationships

## **Phase 5: Invoice Management**
13. **Invoice Creation**
    - Test creating invoices for clients
    - Test linking invoices to specific projects
    - Test invoice number generation (auto-generated format)
    - Test invoice amount and tax calculations

14. **Invoice Details and Calculations**
    - Test tax rate application and tax amount calculation
    - Verify total amount calculation (amount + tax)
    - Test invoice dates (issue date, due date)
    - Test invoice description and title fields

15. **Invoice Status Workflow**
    - Test invoice status progression (draft → sent → paid/overdue)
    - Test marking invoices as paid with payment date
    - Test overdue invoice identification
    - Verify invoice status affects dashboard revenue calculations

16. **Invoice-Project-Client Relationships**
    - Test invoice properly links to client and project
    - Verify invoice displays correct client information
    - Test creating invoices for different clients/projects

## **Phase 6: Dashboard and Reporting**
17. **Dashboard Statistics**
    - Test dashboard displays correct client count
    - Test dashboard shows accurate project count
    - Test dashboard calculates total invoices correctly
    - Test revenue calculation (only from paid invoices)

18. **Dashboard Quick Actions**
    - Test navigation to add new client from dashboard
    - Test navigation to create new project from dashboard
    - Test navigation to generate new invoice from dashboard

19. **Dashboard Real-time Updates**
    - Test dashboard stats update after adding clients
    - Test dashboard stats update after creating projects
    - Test dashboard stats update after creating/paying invoices

## **Phase 7: Data Integrity and Security**
20. **User Data Isolation**
    - Test users can only see their own clients
    - Test users can only see their own projects
    - Test users can only see their own invoices
    - Test API endpoints respect user ownership

21. **Data Relationships**
    - Test deleting client affects related projects/invoices appropriately
    - Test project-client relationships remain consistent
    - Test invoice-project-client relationships are maintained

22. **Form Validation and Error Handling**
    - Test all forms with invalid data
    - Test required field validation
    - Test data type validation (numbers, dates, emails)
    - Test API error handling and user feedback

## **Phase 8: User Experience and Interface**
23. **Responsive Design**
    - Test mobile interface on small screens
    - Test tablet interface on medium screens
    - Test desktop interface functionality
    - Test navigation menu collapse/expand on mobile

24. **Loading States and Feedback**
    - Test loading spinners during data fetching
    - Test toast notifications for success/error messages
    - Test empty states for all list views
    - Test form submission feedback

25. **Navigation and Routing**
    - Test all navigation links work correctly
    - Test browser back/forward buttons
    - Test direct URL access to protected routes
    - Test redirect behavior for unauthenticated users

## **Phase 9: End-to-End Workflow Testing**
26. **Complete Contractor Workflow**
    - Register → Login → Add Client → Create Project → Generate Invoice → Mark as Paid
    - Test multiple clients with multiple projects each
    - Test invoice generation for completed projects
    - Verify dashboard reflects all activities accurately

27. **Business Logic Integration**
    - Test project cost tracking affects profitability
    - Test invoice payment affects revenue reporting
    - Test project completion workflow
    - Test client relationship management throughout project lifecycle

This test sequence follows the natural progression of how a contractor would use the app: setting up their account, adding clients, creating projects for those clients, managing tasks within projects, generating invoices, and tracking their business performance through the dashboard.

