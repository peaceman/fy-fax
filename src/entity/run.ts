import { Column, CreateDateColumn, Entity, Generated, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Fax } from "./fax";
import { Template } from "./template";

@Entity()
export class Run {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @ManyToOne(
    () => Template,
    {
      onDelete: "RESTRICT",
      nullable: false,
    }
  )
  template!: Template

  @OneToMany(
    () => Fax,
    fax => fax.run,
  )
  faxes!: Fax

  @CreateDateColumn({
    type: "datetime",
    update: false,
  })
  createdAt!: Date
}
