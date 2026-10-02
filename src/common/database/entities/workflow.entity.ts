import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { EWorkflowStatus } from '@/modules/workflows/enums/workflow-status.enum';

export interface WorkflowNode {
  id: string;
  type?: string;
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

@Entity('workflows')
export class WorkflowEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EWorkflowStatus,
    default: EWorkflowStatus.DRAFT,
  })
  status: EWorkflowStatus;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;

  @Column({ type: 'jsonb' })
  graph: WorkflowGraph;

  @Column()
  createdById: number;

  @ManyToOne(() => UserEntity, (user) => user.workflows, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy: UserEntity;
}
