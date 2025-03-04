export enum JobType {
  EMAIL = 'email',
}

export interface Job {
  id: string;
  name: string;
  type: JobType;
  start: number;
  repeat?: string;
  data: any;
}

export interface EmailJob extends Job {
  type: JobType.EMAIL;
  data: {
    to: string;
    from: string;
    subject: string;
    body: string;
  };
}
