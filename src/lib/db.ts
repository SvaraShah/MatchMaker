import fs from 'fs';
import path from 'path';
import { Customer, MatchState } from '../types/matchmaker';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

interface DatabaseSchema {
  customers: Customer[];
  matches: MatchState[];
}

// Ensure the database is initialized
function getDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { customers: [], matches: [] };
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (error) {
    console.error('Failed to read database:', error);
    return { customers: [], matches: [] };
  }
}

function saveDB(data: DatabaseSchema): boolean {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write to database:', error);
    return false;
  }
}

export function getCustomers(): Customer[] {
  return getDB().customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return getDB().customers.find(c => c.id === id);
}

export function saveCustomer(updatedCustomer: Customer): boolean {
  const db = getDB();
  const idx = db.customers.findIndex(c => c.id === updatedCustomer.id);
  if (idx !== -1) {
    db.customers[idx] = {
      ...updatedCustomer,
      lastUpdated: new Date().toISOString()
    };
    return saveDB(db);
  }
  return false;
}

export function getMatchStates(): MatchState[] {
  return getDB().matches || [];
}

export function saveMatchState(state: Omit<MatchState, 'createdAt'>): boolean {
  const db = getDB();
  if (!db.matches) {
    db.matches = [];
  }
  
  // Remove existing match state for this pair if it exists
  db.matches = db.matches.filter(
    m => !(m.customerId === state.customerId && m.matchId === state.matchId)
  );
  
  db.matches.push({
    ...state,
    createdAt: new Date().toISOString()
  });
  
  return saveDB(db);
}
