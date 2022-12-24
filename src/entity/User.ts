import {Entity, Column} from "typeorm"
import {Common} from "./Common";

@Entity()
export class User extends Common{
    @Column()
    id:string;

    @Column()
    password:string;

    @Column()
    name:string;

}