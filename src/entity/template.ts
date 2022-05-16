import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm"

@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @Index("te_na_idx", { unique: true })
  name!: string

  @Column("text")
  content!: string
}
