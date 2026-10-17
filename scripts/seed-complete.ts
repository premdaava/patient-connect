export const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
  'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
  'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery', 'David',
  'Ella', 'Joseph', 'Scarlett', 'Samuel', 'Grace', 'Sebastian', 'Chloe', 'John', 'Victoria', 'Andrew',
  'Madison', 'Joshua', 'Luna', 'Christopher', 'Penelope', 'Nicholas', 'Layla', 'Dylan', 'Riley', 'Ryan',
  'Zoey', 'Nathan', 'Nora', 'Isaac', 'Lily', 'Gabriel', 'Eleanor', 'Christian', 'Hannah', 'Jonathan',
];

export const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
];

export const patientTags = ['VIP', 'New Patient', 'Regular', 'Family', 'Senior', 'Reminder Needed', 'High Priority'];
export const appointmentTypes = ['Cleaning', 'Exam', 'Whitening', 'Consultation', 'Follow-up', 'Root Canal', 'Filling'];

export function generatePhone(): string {
  const area = Math.floor(Math.random() * 800) + 200;
  const prefix = Math.floor(Math.random() * 800) + 200;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `+1${area}${prefix}${line}`;
}

export function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
