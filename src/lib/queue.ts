import { Database } from 'bun:sqlite';
import { serialize, deserialize } from 'node:v8';

export interface QueueItem {
  id: number;
  jobId: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: Date;
  execute_at: Date;
  completed_at?: Date;
  failed_at?: Date;
  cancelled_at?: Date;
}

export class Queue<DATA = any> {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { create: true });
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.run(`
      CREATE TABLE IF NOT EXISTS queue_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobId TEXT NOT NULL,
        payload BLOB NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        execute_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        failed_at DATETIME,
        cancelled_at DATETIME
        );
      
      CREATE INDEX IF NOT EXISTS idx_jobId ON queue_items (jobId);
      CREATE INDEX IF NOT EXISTS idx_status ON queue_items (status);
      CREATE INDEX IF NOT EXISTS idx_execute_at ON queue_items (execute_at);
    `);
  }

  enqueue(jobId: string, payload: DATA, delay?: number | Date) {
    const executeAt = delay instanceof Date ? delay : new Date(Date.now() + (delay || 0));
    this.db.run(
      `INSERT INTO queue_items (jobId, payload, status, execute_at) VALUES (?, ?, ?, ?)`,
      jobId,
      serialize(payload) as any,
      'pending',
      executeAt.toISOString(),
    );
  }

  dequeue() {
    const stmt = this.db.prepare(`
      UPDATE queue_items
      SET status = 'processing'
      WHERE id = (
        SELECT id FROM queue_items
        WHERE status = 'pending' AND execute_at <= ?
        ORDER BY execute_at ASC, created_at ASC
        LIMIT 1
      )
      RETURNING *
    `);
    const result = stmt.get(new Date().toISOString()) as QueueItem | null;
    return result ? { ...result, payload: deserialize(result.payload) as DATA } : null;
  }

  complete(id: number) {
    const stmt = this.db.prepare(`
      UPDATE queue_items
      SET status = 'completed', completed_at = ?
      WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), id);
  }

  fail(id: number) {
    const stmt = this.db.prepare(`
      UPDATE queue_items
      SET status = 'failed', failed_at = ?
      WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), id);
  }

  getNextExecutionTime() {
    const stmt = this.db.prepare(`
      SELECT execute_at
      FROM queue_items
      WHERE status = 'pending'
      ORDER BY execute_at ASC, created_at ASC
      LIMIT 1
    `);
    const result = stmt.get() as { execute_at: string } | null;
    return result ? new Date(result.execute_at) : null;
  }

  cancel(jobId: string) {
    const stmt = this.db.prepare(`
      UPDATE queue_items
      SET status = 'cancelled', cancelled_at = ?
      WHERE jobId = ?
      AND status = 'pending'
    `);
    stmt.run(new Date().toISOString(), jobId);
  }

  isEmpty() {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM queue_items
      WHERE status = 'pending'
    `);
    const result = stmt.get() as { count: number };
    return result.count === 0;
  }
}
