import {Column, Entity, JoinColumn, ManyToOne, UpdateDateColumn} from 'typeorm';
import {Common} from './interfaces/Common';
import {Model} from './Model';
import {User} from './User';

export enum HistoryStatus {
    CACHED = 'cached',
    INITIALIZING = 'initializing',
    RUNNING = 'running',
    ERROR = 'error',
    OFF = 'off',
}

@Entity()
export class History extends Common {
    @Column({type: 'enum', enum: HistoryStatus})
        status: string;
    @Column()
        containerId: string;
    @Column()
        inputPath: string;
    @Column()
        outputPath: string;
    @ManyToOne(
        () => User,
        (user) => user.id
    )
    @JoinColumn()
        register: User;

    @ManyToOne(
        () => Model,
        (model) => model.id
    )
    @JoinColumn()
        model: Model;

    @Column()
        startedTime: Date;
    @Column()
        endedTime: Date;
}