import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { WorkflowEntity } from '@/common/database/entities';
import { ERROR_CODE } from '@/common/filters';
import {
  ForbiddenException,
  NotFoundException,
} from '@/common/filters/exception';
import { SortOrder } from '@/common/helper/enums/query.enum';
import { IAuthUser } from '@/common/request/interfaces';
import {
  ApiGenericResponseDto,
  ApiResponseDto,
  PaginatedResponseDto,
} from '@/common/response';
import { WorkflowRepositoryImpl } from '../repositories/workflow.repository';
import { CreateWorkflowDto } from '../dtos/requests/workflow.create.dto';
import { UpdateWorkflowDto } from '../dtos/requests/workflow.update.dto';
import { WorkflowRequestDto } from '../dtos/requests/workflow.get.dto';
import { WorkflowResponseDto } from '../dtos/responses/workflow.response.dto';
import { WorkflowMapper } from '../mappers/workflow.mapper';
import { EWorkflowStatus } from '../enums';

@Injectable()
export class WorkflowService {
  constructor(private readonly workflowRepository: WorkflowRepositoryImpl) {}

  async createWorkflow(
    payload: CreateWorkflowDto,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<WorkflowResponseDto>> {
    const workflow = await this.workflowRepository.create({
      name: payload.name,
      graph: payload.graph,
      status: EWorkflowStatus.DRAFT,
      createdById: authUser.userId,
    });

    return ApiResponseDto.success(WorkflowMapper.toResponse(workflow));
  }

  async getWorkflows(
    query: WorkflowRequestDto,
    authUser: IAuthUser,
  ): Promise<PaginatedResponseDto<WorkflowResponseDto>> {
    const { limit, page, keyword, status } = query;

    const where: FindOptionsWhere<WorkflowEntity> = {
      createdById: authUser.userId,
      ...(status && { status }),
      ...(keyword && {
        name: ILike(`%${keyword.replace(/[\\%_]/g, '\\$&')}%`),
      }),
    };

    const workflows = await this.workflowRepository.findMany(
      { limit, page },
      {
        where,
        sort: {
          updatedAt: SortOrder.DESC,
          id: SortOrder.DESC,
        },
      },
    );

    return PaginatedResponseDto.success(
      WorkflowMapper.toResponses(workflows.data),
      workflows.meta,
    );
  }

  async getWorkflow(
    id: number,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<WorkflowResponseDto>> {
    const workflow = await this.findOwnedWorkflow(id, authUser);
    return ApiResponseDto.success(WorkflowMapper.toResponse(workflow));
  }

  async updateWorkflow(
    id: number,
    payload: UpdateWorkflowDto,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<WorkflowResponseDto>> {
    const workflow = await this.findOwnedWorkflow(id, authUser);

    const updated = await this.workflowRepository.update(workflow.id, {
      ...payload,
      ...this.resolvePublishedAt(workflow, payload.status),
    });

    return ApiResponseDto.success(WorkflowMapper.toResponse(updated));
  }

  async deleteWorkflow(
    id: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    const workflow = await this.findOwnedWorkflow(id, authUser);
    await this.workflowRepository.softRemove(workflow.id);
    return ApiGenericResponseDto.success('Workflow deleted successfully');
  }

  private async findOwnedWorkflow(
    id: number,
    authUser: IAuthUser,
  ): Promise<WorkflowEntity> {
    const workflow = await this.workflowRepository.findOneBy({ id });

    if (!workflow) {
      throw new NotFoundException(ERROR_CODE.WORKFLOW_NOT_FOUND);
    }
    if (workflow.createdById !== authUser.userId) {
      throw new ForbiddenException(ERROR_CODE.WORKFLOW_FORBIDDEN);
    }

    return workflow;
  }

  private resolvePublishedAt(
    workflow: WorkflowEntity,
    nextStatus?: EWorkflowStatus,
  ): Pick<WorkflowEntity, 'publishedAt'> | undefined {
    if (!nextStatus || nextStatus === workflow.status) {
      return undefined;
    }
    if (nextStatus === EWorkflowStatus.PUBLISHED) {
      return { publishedAt: new Date() };
    }
    if (nextStatus === EWorkflowStatus.DRAFT) {
      return { publishedAt: null };
    }
    return undefined;
  }
}
