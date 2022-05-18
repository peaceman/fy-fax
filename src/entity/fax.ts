import { Column, Entity, Generated, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm"
import { Recipient } from "./recipient"
import { Run } from "./run"

@Entity()
export class Fax {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
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

  @RelationId((fax: Fax) => fax.recipient)
  recipientId!: number

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
