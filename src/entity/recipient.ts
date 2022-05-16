import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity()
export class Recipient {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @Index("re_fn_uq", { unique: true })
  faxNumber!: string

  @Column("simple-json")
  data!: object
}
