import { Column, Table } from '$lib/zORM';
import module from '../manufacturing.module';

@Table({
  DATABASE: module.database.name,
})
export class Structure {
  @Column({ primary: true, unique: true })
  id: number;

  @Column()
  name: string;

  @Column()
  typeID: number;

  @Column()
  rig1TypeID: number;

  @Column()
  rig2TypeID: number;

  @Column()
  rig3TypeID: number;

  @Column()
  solarSystemID: number;

  @Column()
  regionID: number;

  @Column()
  constellationID: number;

  @Column()
  security: number;
}
