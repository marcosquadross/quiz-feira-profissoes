import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Quiz } from '../../quizzes/schemas/quiz.schema';
import { Response } from '../../response/schemas/response.schema';

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    hashedRefreshToken: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Quiz, quiz => quiz.user, { cascade: true, onDelete: 'CASCADE' })
    quizzes: Quiz[];

    @OneToMany(() => Response, response => response.user, { cascade: true, onDelete: 'CASCADE' })
    responses: Response[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
