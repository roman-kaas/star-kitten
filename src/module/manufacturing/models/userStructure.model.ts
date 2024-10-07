import { Column, OneToOne, Table } from '$lib/zORM';
import module from '../manufacturing.module';
import type { Structure } from './structure.model';

@Table({
  DATABASE: module.database.name,
  indices: [(u: UserStructure) => u.userID],
})
export class UserStructure {
  @Column({ primary: true, unique: true })
  id: number;

  @Column()
  userID: number;

  @Column()
  structureID: number;

  @Column()
  nickname: string;

  @Column()
  active: boolean;

  @OneToOne('Structure', (structure: Structure) => structure.id)
  structure: Structure;

  @Column()
  configuration: number; // uses StructConfigFlag
}
