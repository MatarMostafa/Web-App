import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: "Information Technology" },
      update: {},
      create: {
        name: "Information Technology",
        description: "IT Department",
        code: "IT",
      },
    }),
    prisma.department.upsert({
      where: { name: "Human Resources" },
      update: {},
      create: {
        name: "Human Resources",
        description: "HR Department",
        code: "HR",
      },
    }),
    prisma.department.upsert({
      where: { name: "Finance" },
      update: {},
      create: {
        name: "Finance",
        description: "Finance Department",
        code: "FIN",
      },
    }),
    prisma.department.upsert({
      where: { name: "Marketing" },
      update: {},
      create: {
        name: "Marketing",
        description: "Marketing Department",
        code: "MKT",
      },
    }),
  ]);

  // Create positions
  const positions = await Promise.all([
    prisma.position.upsert({
      where: { title_departmentId: { title: "Software Developer", departmentId: departments[0].id } },
      update: {},
      create: {
        title: "Software Developer",
        description: "Full-stack developer",
        level: 2,
        departmentId: departments[0].id,
        minSalary: 50000,
        maxSalary: 80000,
      },
    }),
    prisma.position.upsert({
      where: { title_departmentId: { title: "HR Manager", departmentId: departments[1].id } },
      update: {},
      create: {
        title: "HR Manager",
        description: "Human Resources Manager",
        level: 3,
        departmentId: departments[1].id,
        minSalary: 60000,
        maxSalary: 90000,
      },
    }),
    prisma.position.upsert({
      where: { title_departmentId: { title: "Financial Analyst", departmentId: departments[2].id } },
      update: {},
      create: {
        title: "Financial Analyst",
        description: "Financial data analyst",
        level: 2,
        departmentId: departments[2].id,
        minSalary: 45000,
        maxSalary: 70000,
      },
    }),
    prisma.position.upsert({
      where: { title_departmentId: { title: "Marketing Specialist", departmentId: departments[3].id } },
      update: {},
      create: {
        title: "Marketing Specialist",
        description: "Digital marketing specialist",
        level: 2,
        departmentId: departments[3].id,
        minSalary: 40000,
        maxSalary: 65000,
      },
    }),
  ]);

  // Create users and employees
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        email: "admin@company.com",
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: true,
        employee: {
          create: {
            employeeCode: "EMP001",
            firstName: "John",
            lastName: "Admin",
            phoneNumber: "+1-555-0101",
            address: "123 Admin St, City, State 12345",
            hireDate: new Date("2023-01-15"),
            dateOfBirth: new Date("1985-03-20"),
            departmentId: departments[0].id,
            positionId: positions[0].id,
            salary: 75000,
            scheduleType: "FULL_TIME",
            priority: 1,
            emergencyContact: {
              name: "Jane Admin",
              relationship: "Spouse",
              phone: "+1-555-0102",
            },
          },
        },
      },
      include: { employee: true },
    }),
    prisma.user.upsert({
      where: { username: "hrmanager" },
      update: {},
      create: {
        email: "hr@company.com",
        username: "hrmanager",
        password: hashedPassword,
        role: "HR_MANAGER",
        emailVerified: true,
        employee: {
          create: {
            employeeCode: "EMP002",
            firstName: "Sarah",
            lastName: "Johnson",
            phoneNumber: "+1-555-0201",
            address: "456 HR Ave, City, State 12345",
            hireDate: new Date("2023-02-01"),
            dateOfBirth: new Date("1988-07-15"),
            departmentId: departments[1].id,
            positionId: positions[1].id,
            salary: 70000,
            scheduleType: "FULL_TIME",
            priority: 2,
            emergencyContact: {
              name: "Mike Johnson",
              relationship: "Husband",
              phone: "+1-555-0202",
            },
          },
        },
      },
      include: { employee: true },
    }),
    prisma.user.upsert({
      where: { username: "employee1" },
      update: {},
      create: {
        email: "employee1@company.com",
        username: "employee1",
        password: hashedPassword,
        role: "EMPLOYEE",
        emailVerified: true,
        employee: {
          create: {
            employeeCode: "EMP003",
            firstName: "Mike",
            lastName: "Developer",
            phoneNumber: "+1-555-0301",
            address: "789 Dev Rd, City, State 12345",
            hireDate: new Date("2023-03-10"),
            dateOfBirth: new Date("1992-11-08"),
            departmentId: departments[0].id,
            positionId: positions[0].id,
            salary: 65000,
            scheduleType: "FULL_TIME",
            priority: 3,
            emergencyContact: {
              name: "Lisa Developer",
              relationship: "Sister",
              phone: "+1-555-0302",
            },
          },
        },
      },
      include: { employee: true },
    }),
    prisma.user.upsert({
      where: { username: "employee2" },
      update: {},
      create: {
        email: "employee2@company.com",
        username: "employee2",
        password: hashedPassword,
        role: "EMPLOYEE",
        emailVerified: true,
        employee: {
          create: {
            employeeCode: "EMP004",
            firstName: "Emma",
            lastName: "Analyst",
            phoneNumber: "+1-555-0401",
            address: "321 Finance Blvd, City, State 12345",
            hireDate: new Date("2023-04-05"),
            dateOfBirth: new Date("1990-05-22"),
            departmentId: departments[2].id,
            positionId: positions[2].id,
            salary: 55000,
            scheduleType: "FULL_TIME",
            priority: 4,
            emergencyContact: {
              name: "Tom Analyst",
              relationship: "Father",
              phone: "+1-555-0402",
            },
          },
        },
      },
      include: { employee: true },
    }),
    prisma.user.upsert({
      where: { username: "teamleader" },
      update: {},
      create: {
        email: "teamleader@company.com",
        username: "teamleader",
        password: hashedPassword,
        role: "TEAM_LEADER",
        emailVerified: true,
        employee: {
          create: {
            employeeCode: "EMP005",
            firstName: "Alex",
            lastName: "Leader",
            phoneNumber: "+1-555-0501",
            address: "555 Leader Lane, City, State 12345",
            hireDate: new Date("2023-01-20"),
            dateOfBirth: new Date("1987-09-12"),
            departmentId: departments[0].id,
            positionId: positions[0].id,
            salary: 80000,
            scheduleType: "FULL_TIME",
            priority: 1,
            emergencyContact: {
              name: "Sam Leader",
              relationship: "Partner",
              phone: "+1-555-0502",
            },
          },
        },
      },
      include: { employee: true },
    }),
  ]);

  // Create teams (one per leader)
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { name: "Development Team" },
      update: {},
      create: {
        name: "Development Team",
        description: "Frontend and backend development team",
        teamLeaderId: users[4].employee!.id,
      },
    }),
  ]);

  // Add team members
  await Promise.all([
    prisma.teamMember.upsert({
      where: {
        teamId_employeeId: {
          teamId: teams[0].id,
          employeeId: users[0].employee!.id,
        },
      },
      update: {},
      create: {
        teamId: teams[0].id,
        employeeId: users[0].employee!.id,
      },
    }),
    prisma.teamMember.upsert({
      where: {
        teamId_employeeId: {
          teamId: teams[0].id,
          employeeId: users[2].employee!.id,
        },
      },
      update: {},
      create: {
        teamId: teams[0].id,
        employeeId: users[2].employee!.id,
      },
    }),
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { taxNumber: "TAX001" },
      update: {},
      create: {
        companyName: "Tech Solutions Inc",
        contactEmail: "contact@techsolutions.com",
        contactPhone: "+1-555-1001",
        industry: "Technology",
        taxNumber: "TAX001",
        address: {
          street: "100 Tech Park",
          city: "Silicon Valley",
          state: "CA",
          zip: "94000",
        },
      },
    }),
    prisma.customer.upsert({
      where: { taxNumber: "TAX002" },
      update: {},
      create: {
        companyName: "Global Marketing Corp",
        contactEmail: "info@globalmarketing.com",
        contactPhone: "+1-555-2001",
        industry: "Marketing",
        taxNumber: "TAX002",
        address: {
          street: "200 Marketing Ave",
          city: "New York",
          state: "NY",
          zip: "10001",
        },
      },
    }),
  ]);

  // Create qualifications
  const qualifications = await Promise.all([
    prisma.qualification.upsert({
      where: { name: "JavaScript Programming" },
      update: {},
      create: {
        name: "JavaScript Programming",
        description: "Proficiency in JavaScript development",
        category: "Technical",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "Project Management" },
      update: {},
      create: {
        name: "Project Management",
        description: "Project management skills",
        category: "Management",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "Data Analysis" },
      update: {},
      create: {
        name: "Data Analysis",
        description: "Data analysis and reporting",
        category: "Technical",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "React Development" },
      update: {},
      create: {
        name: "React Development",
        description: "Frontend development with React framework",
        category: "Technical",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "Database Management" },
      update: {},
      create: {
        name: "Database Management",
        description: "SQL and database administration",
        category: "Technical",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "Team Leadership" },
      update: {},
      create: {
        name: "Team Leadership",
        description: "Leading and managing teams",
        category: "Management",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "Customer Service" },
      update: {},
      create: {
        name: "Customer Service",
        description: "Customer relationship management",
        category: "Soft Skills",
      },
    }),
    prisma.qualification.upsert({
      where: { name: "German Language" },
      update: {},
      create: {
        name: "German Language",
        description: "German language proficiency",
        category: "Language",
        requiresCertificate: true,
        expiryMonths: 24,
      },
    }),
  ]);

  // Create employee qualifications
  await Promise.all([
    prisma.employeeQualification.upsert({
      where: {
        employeeId_qualificationId: {
          employeeId: users[0].employee!.id,
          qualificationId: qualifications[0].id,
        },
      },
      update: {},
      create: {
        employeeId: users[0].employee!.id,
        qualificationId: qualifications[0].id,
        proficiencyLevel: 5,
        isVerified: true,
      },
    }),
    prisma.employeeQualification.upsert({
      where: {
        employeeId_qualificationId: {
          employeeId: users[2].employee!.id,
          qualificationId: qualifications[0].id,
        },
      },
      update: {},
      create: {
        employeeId: users[2].employee!.id,
        qualificationId: qualifications[0].id,
        proficiencyLevel: 4,
        isVerified: true,
      },
    }),
    prisma.employeeQualification.upsert({
      where: {
        employeeId_qualificationId: {
          employeeId: users[3].employee!.id,
          qualificationId: qualifications[2].id,
        },
      },
      update: {},
      create: {
        employeeId: users[3].employee!.id,
        qualificationId: qualifications[2].id,
        proficiencyLevel: 4,
        isVerified: true,
      },
    }),
  ]);

  // Create activities
  const activities = await Promise.all([
    prisma.activity.upsert({
      where: { name: "Container Unloading" },
      update: {},
      create: {
        name: "Container Unloading",
        type: "CONTAINER_UNLOADING",
        code: "CU001",
        unit: "hour",
        description: "Unloading containers from trucks"
      },
    }),
    prisma.activity.upsert({
      where: { name: "Wrapping" },
      update: {},
      create: {
        name: "Wrapping",
        type: "WRAPPING",
        code: "WR001",
        unit: "piece",
        description: "Wrapping goods for shipment"
      },
    }),
    prisma.activity.upsert({
      where: { name: "Repacking" },
      update: {},
      create: {
        name: "Repacking",
        type: "REPACKING",
        code: "RP001",
        unit: "hour",
        description: "Repacking items for distribution"
      },
    }),
  ]);

  // Create customer pricing tiers
  await Promise.all([
    prisma.customerPrice.upsert({
      where: {
        customerId_activityId_minQuantity_maxQuantity_effectiveFrom: {
          customerId: customers[0].id,
          activityId: activities[0].id,
          minQuantity: 1,
          maxQuantity: 10,
          effectiveFrom: new Date("2024-01-01")
        }
      },
      update: {},
      create: {
        customerId: customers[0].id,
        activityId: activities[0].id,
        minQuantity: 1,
        maxQuantity: 10,
        price: 25.00,
        currency: "EUR",
        effectiveFrom: new Date("2024-01-01")
      },
    }),
    prisma.customerPrice.upsert({
      where: {
        customerId_activityId_minQuantity_maxQuantity_effectiveFrom: {
          customerId: customers[0].id,
          activityId: activities[0].id,
          minQuantity: 11,
          maxQuantity: 999999,
          effectiveFrom: new Date("2024-01-01")
        }
      },
      update: {},
      create: {
        customerId: customers[0].id,
        activityId: activities[0].id,
        minQuantity: 11,
        maxQuantity: 999999,
        price: 22.00,
        currency: "EUR",
        effectiveFrom: new Date("2024-01-01")
      },
    }),
    prisma.customerPrice.upsert({
      where: {
        customerId_activityId_minQuantity_maxQuantity_effectiveFrom: {
          customerId: customers[1].id,
          activityId: activities[1].id,
          minQuantity: 1,
          maxQuantity: 50,
          effectiveFrom: new Date("2024-01-01")
        }
      },
      update: {},
      create: {
        customerId: customers[1].id,
        activityId: activities[1].id,
        minQuantity: 1,
        maxQuantity: 50,
        price: 15.00,
        currency: "EUR",
        effectiveFrom: new Date("2024-01-01")
      },
    }),
    prisma.customerPrice.upsert({
      where: {
        customerId_activityId_minQuantity_maxQuantity_effectiveFrom: {
          customerId: customers[1].id,
          activityId: activities[1].id,
          minQuantity: 51,
          maxQuantity: 999999,
          effectiveFrom: new Date("2024-01-01")
        }
      },
      update: {},
      create: {
        customerId: customers[1].id,
        activityId: activities[1].id,
        minQuantity: 51,
        maxQuantity: 999999,
        price: 12.00,
        currency: "EUR",
        effectiveFrom: new Date("2024-01-01")
      },
    }),
  ]);

  // Create orders
  const orders = await Promise.all([
    prisma.order.upsert({
      where: { orderNumber: "ORD-2024-001" },
      update: {},
      create: {
        orderNumber: "ORD-2024-001",
        description: "Website Development Project - Develop a new company website",
        scheduledDate: new Date("2024-02-01"),
        startTime: new Date("2024-02-01T09:00:00Z"),
        endTime: new Date("2024-02-01T17:00:00Z"),
        duration: 480,
        location: "Remote",
        requiredEmployees: 2,
        priority: 1,
        status: "ACTIVE",
        customerId: customers[0].id,
        teamId: teams[0].id,
        createdBy: users[0].id,
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: "ORD-2024-002" },
      update: {},
      create: {
        orderNumber: "ORD-2024-002",
        description: "Marketing Campaign Analysis - Analyze marketing campaign performance",
        scheduledDate: new Date("2024-02-15"),
        startTime: new Date("2024-02-15T10:00:00Z"),
        endTime: new Date("2024-02-15T16:00:00Z"),
        duration: 360,
        location: "Office",
        requiredEmployees: 1,
        priority: 2,
        status: "OPEN",
        customerId: customers[1].id,
        createdBy: users[1].id,
      },
    }),
  ]);

  // Create assignments
  await Promise.all([
    prisma.assignment.create({
      data: {
        orderId: orders[0].id,
        employeeId: users[0].employee!.id,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-28"),
        status: "ACTIVE",
        estimatedHours: 160,
        createdBy: users[1].id,
      },
    }),
    prisma.assignment.create({
      data: {
        orderId: orders[0].id,
        employeeId: users[2].employee!.id,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-28"),
        status: "ACTIVE",
        estimatedHours: 120,
        createdBy: users[1].id,
      },
    }),
  ]);

  // Create absences
  await Promise.all([
    prisma.absence.create({
      data: {
        employeeId: users[2].employee!.id,
        type: "VACATION",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-20"),
        reason: "Family vacation",
        status: "APPROVED",
        approvedBy: users[1].id,
        approvedAt: new Date(),
      },
    }),
    prisma.absence.create({
      data: {
        employeeId: users[3].employee!.id,
        type: "SICK_LEAVE",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-12"),
        reason: "Flu symptoms",
        status: "APPROVED",
        approvedBy: users[1].id,
        approvedAt: new Date(),
      },
    }),
    prisma.absence.create({
      data: {
        employeeId: users[2].employee!.id,
        type: "PERSONAL_LEAVE",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-04-02"),
        reason: "Personal matters",
        status: "PENDING",
      },
    }),
  ]);

  // Create ratings
  await Promise.all([
    prisma.rating.create({
      data: {
        orderId: orders[0].id,
        employeeId: users[0].employee!.id,
        customerId: customers[0].id,
        rating: 5,
        comment: "Excellent work quality and timely delivery",
        category: "Performance",
        status: "EXCELLENT",
        ratedBy: customers[0].id,
      },
    }),
    prisma.rating.create({
      data: {
        orderId: orders[0].id,
        employeeId: users[2].employee!.id,
        customerId: customers[0].id,
        rating: 4,
        comment: "Good collaboration and technical skills",
        category: "Performance",
        status: "GOOD",
        ratedBy: customers[0].id,
      },
    }),
  ]);

  // Create work statistics
  await Promise.all([
    prisma.workStatistic.upsert({
      where: {
        employeeId_date: {
          employeeId: users[0].employee!.id,
          date: new Date("2024-01-15"),
        },
      },
      update: {},
      create: {
        date: new Date("2024-01-15"),
        employeeId: users[0].employee!.id,
        hoursWorked: 8.5,
        overtimeHours: 0.5,
        location: "Office",
        projects: ["Website Development"],
        efficiency: 0.95,
        qualityScore: 0.92,
      },
    }),
    prisma.workStatistic.upsert({
      where: {
        employeeId_date: {
          employeeId: users[2].employee!.id,
          date: new Date("2024-01-15"),
        },
      },
      update: {},
      create: {
        date: new Date("2024-01-15"),
        employeeId: users[2].employee!.id,
        hoursWorked: 8.0,
        overtimeHours: 0.0,
        location: "Remote",
        projects: ["Website Development"],
        efficiency: 0.88,
        qualityScore: 0.9,
      },
    }),
  ]);

  // Create performance thresholds
  await Promise.all([
    prisma.performanceThreshold.upsert({
      where: { departmentId: departments[0].id },
      update: {},
      create: {
        departmentId: departments[0].id, // IT
        redMin: 0,
        redMax: 60,
        yellowMin: 61,
        yellowMax: 80,
        greenMin: 81,
        greenMax: 100,
      },
    }),
    prisma.performanceThreshold.upsert({
      where: { departmentId: departments[1].id },
      update: {},
      create: {
        departmentId: departments[1].id, // HR
        redMin: 0,
        redMax: 65,
        yellowMin: 66,
        yellowMax: 85,
        greenMin: 86,
        greenMax: 100,
      },
    }),
  ]);

  // Create employee performance records
  await Promise.all([
    prisma.employeePerformance.create({
      data: {
        employeeId: users[2].employee!.id,
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-01-31"),
        score: 92,
        trafficLight: "GREEN",
        trafficLightReason: "Excellent performance with high efficiency and quality",
        metrics: {
          efficiency: 0.95,
          quality: 0.92,
          punctuality: 0.98,
          teamwork: 0.90,
        },
        manualOverride: false,
      },
    }),
    prisma.employeePerformance.create({
      data: {
        employeeId: users[2].employee!.id,
        periodStart: new Date("2023-12-01"),
        periodEnd: new Date("2023-12-31"),
        score: 75,
        trafficLight: "YELLOW",
        trafficLightReason: "Good performance but room for improvement in efficiency",
        metrics: {
          efficiency: 0.88,
          quality: 0.90,
          punctuality: 0.85,
          teamwork: 0.92,
        },
        manualOverride: false,
      },
    }),
    prisma.employeePerformance.create({
      data: {
        employeeId: users[3].employee!.id,
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-01-31"),
        score: 55,
        trafficLight: "RED",
        trafficLightReason: "Below expectations, needs improvement in multiple areas",
        metrics: {
          efficiency: 0.65,
          quality: 0.70,
          punctuality: 0.75,
          teamwork: 0.80,
        },
        manualOverride: false,
      },
    }),
  ]);

  // Create sample files
  await Promise.all([
    prisma.file.create({
      data: {
        filename: "resume_john_admin.pdf",
        originalName: "John_Admin_Resume.pdf",
        mimeType: "application/pdf",
        size: 245760,
        path: "/uploads/resume_john_admin.pdf",
        documentType: "RESUME",
        description: "Employee resume and CV",
        employeeId: users[0].employee!.id,
        uploadedBy: users[1].id,
        isVerified: true,
        isPublic: false,
      },
    }),
    prisma.file.create({
      data: {
        filename: "contract_mike_developer.pdf",
        originalName: "Employment_Contract_Mike.pdf",
        mimeType: "application/pdf",
        size: 189440,
        path: "/uploads/contract_mike_developer.pdf",
        documentType: "CONTRACT",
        description: "Employment contract",
        employeeId: users[2].employee!.id,
        uploadedBy: users[1].id,
        isVerified: true,
        isPublic: false,
      },
    }),
    prisma.file.create({
      data: {
        filename: "certificate_javascript.jpg",
        originalName: "JavaScript_Certificate.jpg",
        mimeType: "image/jpeg",
        size: 156672,
        path: "/uploads/certificate_javascript.jpg",
        documentType: "CERTIFICATE",
        description: "JavaScript programming certification",
        employeeId: users[2].employee!.id,
        uploadedBy: users[2].id,
        isVerified: false,
        isPublic: false,
        expiryDate: new Date("2026-12-31"),
      },
    }),
  ]);

  // Update employee performance scores
  await Promise.all([
    prisma.employee.update({
      where: { id: users[2].employee!.id },
      data: {
        performanceScore: 92,
        trafficLight: "GREEN",
      },
    }),
    prisma.employee.update({
      where: { id: users[3].employee!.id },
      data: {
        performanceScore: 55,
        trafficLight: "RED",
      },
    }),
  ]);

  // Create notification templates for settings changes
  await Promise.all([
    prisma.notificationTemplate.upsert({
      where: { key: "SETTINGS_CHANGE_REQUESTED" },
      update: {},
      create: {
        key: "SETTINGS_CHANGE_REQUESTED",
        title: "Settings Change Request",
        body: "{{employeeName}} has requested to change their {{changeType}} from '{{currentValue}}' to '{{requestedValue}}'. Reason: {{reason}}",
        defaultChannels: ["in_app", "email"],
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { key: "SETTINGS_CHANGE_APPROVED" },
      update: {},
      create: {
        key: "SETTINGS_CHANGE_APPROVED",
        title: "Settings Change Approved",
        body: "Your request to change {{changeType}} has been approved by {{reviewerName}}.",
        defaultChannels: ["in_app", "email"],
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { key: "SETTINGS_CHANGE_REJECTED" },
      update: {},
      create: {
        key: "SETTINGS_CHANGE_REJECTED",
        title: "Settings Change Rejected",
        body: "Your request to change {{changeType}} has been rejected. Reason: {{reviewNotes}}",
        defaultChannels: ["in_app", "email"],
      },
    }),
  ]);

  // Create system config
  await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: "company_name" },
      update: {},
      create: {
        key: "company_name",
        value: "Employee Management System",
        description: "Company name displayed in the application",
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: "max_vacation_days" },
      update: {},
      create: {
        key: "max_vacation_days",
        value: "25",
        description: "Maximum vacation days per year",
      },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log(`Created:`);
  console.log(`- ${departments.length} departments`);
  console.log(`- ${positions.length} positions`);
  console.log(`- ${users.length} users with employees`);
  console.log(`- ${customers.length} customers`);
  console.log(`- ${qualifications.length} qualifications`);
  console.log(`- ${teams.length} teams`);
  console.log(`- ${orders.length} orders`);
  console.log(`- Sample assignments, absences, ratings, and work statistics`);
  console.log(`- Performance thresholds and employee performance records`);
  console.log(`- Sample employee documents and files`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
