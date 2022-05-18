import { Column, Entity, Generated, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Recipient } from "./recipient"
import { Run } from "./run"

@Entity()
export class Fax {
  @PrimaryGeneratedColumn()
  id!: number

  @Generated("uuid")
  identifier!: string

  @ManyToOne(
    () => Run,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  run!: Run

  @ManyToOne(
    () => Recipient,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  recipient!: Recipient

  @Column({
    nullable: true,
  })
  pdfFilePath!: string

  @Index()
  @Column({
    nullable: true,
  })
  externalIdentifier!: string
}
