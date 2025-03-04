import { eq } from 'drizzle-orm';
import { db } from '@db';
import { resumeCommands } from '@db/schema';

export class ResumeCommand {
  id!: string;
  command!: string;
  params!: string;
  context!: string;
  created: Date = new Date();

  private constructor() {
    this.created = new Date();
  }

  public static find(messageId: string) {
    const result = db.select().from(resumeCommands)
        .where(eq(resumeCommands.id, messageId))
        .get();
    return this.createFromQuery(result);
  }

  static create(messageId: string, command: string, params: any = {}, context: any = {}) {
    const resume = new ResumeCommand();
    resume.id = messageId;
    resume.command = command;
    resume.params = JSON.stringify(params);
    resume.context = JSON.stringify(context);
    return resume;
  }

  static createFromQuery(query: any) {
    if (!query) return null;
    const resume = new ResumeCommand();
    resume.id = query.id;
    resume.command = query.command;
    resume.params = query.params;
    resume.context = query.context;
    resume.created = query.created;
    return resume;
  }

  public save() {
    db.insert(resumeCommands)
      .values({
        id: this.id,
        command: this.command,
        params: this.params,
        context: this.context,
        createdAt: this.created.getTime(),
      })
      .onConflictDoUpdate({
        target: resumeCommands.id,
        set: {
          command: this.command,
          params: this.params,
          context: this.context,
        },
      }).run();
    return this;
  }

  public delete() {
    db.delete(resumeCommands)
      .where(eq(resumeCommands.id, this.id))
      .run();
  }

  static delete(messageId: string) {
    db.delete(resumeCommands)
      .where(eq(resumeCommands.id, messageId))
      .run();
  }

}
