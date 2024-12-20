import { Table, Column } from '$lib/zORM';

@Table({ DATABASE: 'kitten' })
export class ResumeCommand {
  @Column({ unique: true, primary: true })
  id: string;

  @Column()
  created: Date = new Date();

  @Column()
  command: string;

  @Column()
  params: string;

  @Column()
  context: string;

  static create(messageId: string, command: string, params: any = {}, context: any = {}) {
    const resume = new ResumeCommand();
    resume.id = messageId;
    resume.command = command;
    resume.params = JSON.stringify(params);
    resume.context = JSON.stringify(context);
    return resume;
  }
}
