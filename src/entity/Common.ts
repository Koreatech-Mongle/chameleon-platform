import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Common {
    @PrimaryGeneratedColumn()
    number: number;

    @Column()
    createdTime: Date;

    @Column()
    updatedTime: Date;
}