// ── Mock data for the entire student dashboard ──
// All data is hardcoded — backend integration will replace these later

export const mockUser = {
  name: "Rahul Kumar",
  roll: "CS2024001",
  branch: "CSIT",
  email: "student@csit.edu.in",
  initials: "RK",
  semester: "5th Semester",
  gpa: "8.4",
  rank: "12th",
  attendancePercent: 87,
  assignmentsCompleted: 14,
  quizzesTaken: 8,
};

export const mockAssignments = [
  { id: 1, subject: "DBMS", title: "ER Diagram Assignment", description: "Design ER diagram for a Hospital Management System", dueDate: "2024-12-20", status: "Pending", marks: null, feedback: null },
  { id: 2, subject: "CN", title: "OSI vs TCP/IP Report", description: "Write a comparative study of OSI and TCP/IP models", dueDate: "2024-12-18", status: "Submitted", marks: null, feedback: null },
  { id: 3, subject: "OS", title: "Process Scheduling Algorithms", description: "Implement FCFS, SJF and Round Robin in C", dueDate: "2024-12-15", status: "Graded", marks: "18/20", feedback: "Excellent work! Good explanation of Round Robin." },
  { id: 4, subject: "DS", title: "Binary Tree Implementation", description: "Implement BST with insert, delete, search operations", dueDate: "2024-12-22", status: "Pending", marks: null, feedback: null },
  { id: 5, subject: "SE", title: "Software Requirements Document", description: "Prepare SRS document for an e-commerce application", dueDate: "2024-12-25", status: "Graded", marks: "17/20", feedback: "Good structure. Functional requirements need more detail." },
];

export const mockTeachers = [
  { id: 1, name: "Dr. Priya Sharma", subject: "DBMS & OS", online: true },
  { id: 2, name: "Prof. Amit Verma", subject: "Computer Networks", online: false },
  { id: 3, name: "Dr. Sunita Rao", subject: "Data Structures", online: true },
  { id: 4, name: "Mr. Rajesh Gupta", subject: "Software Engineering", online: false },
];

export const mockTeacherMessages = {
  1: [
    { id: 1, sender: "teacher", text: "Hi Rahul, how is the ER diagram assignment going?", time: "10:30 AM" },
    { id: 2, sender: "student", text: "Almost done! I had a question about the cardinality notation.", time: "10:32 AM" },
    { id: 3, sender: "teacher", text: "Sure, use Crow's foot notation for clarity. Feel free to share your draft.", time: "10:35 AM" },
  ],
  2: [
    { id: 1, sender: "teacher", text: "Make sure to include protocol comparisons in your report.", time: "Yesterday" },
    { id: 2, sender: "student", text: "Thank you Prof. Verma, I'll add TCP/UDP comparison as well.", time: "Yesterday" },
  ],
  3: [
    { id: 1, sender: "teacher", text: "Rahul, your BST implementation needs edge case handling.", time: "2 days ago" },
    { id: 2, sender: "student", text: "Yes ma'am, I'm adding null checks now.", time: "2 days ago" },
    { id: 3, sender: "teacher", text: "Good. Also test with duplicate values.", time: "2 days ago" },
    { id: 4, sender: "student", text: "Will do. Thank you!", time: "2 days ago" },
  ],
  4: [
    { id: 1, sender: "teacher", text: "Please follow IEEE format for the SRS document.", time: "3 days ago" },
    { id: 2, sender: "student", text: "Understood sir. I'll restructure accordingly.", time: "3 days ago" },
  ],
};

export const mockGroups = [
  { id: 1, name: "DBMS Study Group", members: 5, lastMessage: "Anyone solved Q3?" },
  { id: 2, name: "CN Project Team", members: 3, lastMessage: "Meeting at 5 PM today" },
  { id: 3, name: "DS Lab Partners", members: 4, lastMessage: "Check the shared notes" },
];

export const mockStudents = [
  { id: 1, name: "Ananya Singh", roll: "CS2024002", online: true },
  { id: 2, name: "Vikram Patel", roll: "CS2024003", online: false },
  { id: 3, name: "Pooja Mehta", roll: "CS2024004", online: true },
  { id: 4, name: "Arjun Nair", roll: "CS2024005", online: false },
];

export const mockGroupMessages = {
  1: [
    { id: 1, sender: "Ananya Singh", text: "Has anyone completed the normalization exercise?", time: "2:30 PM" },
    { id: 2, sender: "Vikram Patel", text: "Yes, I got up to 3NF. Need help with BCNF.", time: "2:32 PM" },
    { id: 3, sender: "You", text: "I can share my notes on BCNF. Give me 10 mins.", time: "2:35 PM" },
    { id: 4, sender: "Pooja Mehta", text: "Anyone solved Q3?", time: "2:40 PM" },
  ],
  2: [
    { id: 1, sender: "Arjun Nair", text: "We need to finalize the network topology diagram.", time: "11:00 AM" },
    { id: 2, sender: "You", text: "I'll handle the star topology section.", time: "11:05 AM" },
    { id: 3, sender: "Vikram Patel", text: "Meeting at 5 PM today", time: "11:10 AM" },
  ],
  3: [
    { id: 1, sender: "Pooja Mehta", text: "The linked list lab was tough!", time: "Yesterday" },
    { id: 2, sender: "Ananya Singh", text: "Check the shared notes", time: "Yesterday" },
  ],
};

export const mockStudentMessages = {
  1: [
    { id: 1, sender: "Ananya Singh", text: "Hey Rahul, did you finish the DS assignment?", time: "1:00 PM" },
    { id: 2, sender: "You", text: "Working on it! The recursion part is tricky.", time: "1:02 PM" },
  ],
  2: [],
  3: [
    { id: 1, sender: "Pooja Mehta", text: "Can you share your CN notes?", time: "Yesterday" },
    { id: 2, sender: "You", text: "Sure, I'll send them tonight.", time: "Yesterday" },
  ],
  4: [],
};

export const mockNotifications = [
  { id: 1, message: "New assignment posted: ER Diagram", time: "2 hours ago", unread: true },
  { id: 2, message: "Dr. Priya Sharma graded your OS assignment", time: "5 hours ago", unread: true },
  { id: 3, message: "Quiz results available: Data Structures", time: "1 day ago", unread: false },
  { id: 4, message: "CN Project Team meeting at 5 PM today", time: "1 day ago", unread: false },
];

export const mockProgressData = {
  subjectMarks: [
    { subject: "DBMS", marks: 78, max: 100 },
    { subject: "CN", marks: 85, max: 100 },
    { subject: "OS", marks: 72, max: 100 },
    { subject: "DS", marks: 90, max: 100 },
    { subject: "SE", marks: 68, max: 100 },
  ],
  performanceTrend: [
    { month: "Jul", score: 65 },
    { month: "Aug", score: 70 },
    { month: "Sep", score: 68 },
    { month: "Oct", score: 75 },
    { month: "Nov", score: 82 },
    { month: "Dec", score: 78 },
  ],
  weakAreas: [
    { topic: "Transaction Management", subject: "DBMS", score: 55 },
    { topic: "Network Security", subject: "CN", score: 60 },
    { topic: "Deadlock Handling", subject: "OS", score: 58 },
    { topic: "Graph Algorithms", subject: "DS", score: 62 },
  ],
  assignmentStats: [
    { name: "Submitted", value: 2, fill: "#e8612a" },
    { name: "Graded", value: 2, fill: "#22c55e" },
    { name: "Pending", value: 2, fill: "#f4956a" },
  ],
};

// Fallback quiz questions if AI parse fails
export const fallbackQuizQuestions = [
  { question: "What does ACID stand for in database context?", options: ["Atomicity, Consistency, Isolation, Durability", "Addition, Consistency, Integrity, Durability", "Atomicity, Concurrency, Isolation, Data", "Atomicity, Consistency, Isolation, Data"], correct: 0, explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability — the four key properties of database transactions." },
  { question: "Which data structure uses FIFO principle?", options: ["Stack", "Queue", "Tree", "Graph"], correct: 1, explanation: "A Queue follows First In First Out (FIFO) principle, where the element inserted first is removed first." },
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, explanation: "Binary search has O(log n) time complexity as it halves the search space with each comparison." },
];

// Fallback PYQ analysis data
export const fallbackPYQAnalysis = {
  repeated_topics: ["DBMS Normalization (4x)", "OSI Model (3x)", "Deadlock (3x)", "B+ Trees (2x)", "TCP/IP (2x)"],
  important_topics: ["Database Transactions", "Process Scheduling", "Network Security", "Sorting Algorithms", "ER Diagrams"],
  predicted_questions: [
    "Explain ACID properties with examples.",
    "Compare TCP and UDP protocols.",
    "Write a program for binary search.",
    "Explain deadlock prevention methods.",
    "Draw ER diagram for a library system.",
  ],
};
