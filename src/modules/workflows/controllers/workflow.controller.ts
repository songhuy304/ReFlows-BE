import { ApiEndpoint } from '@/common/doc';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateWorkflowDto } from '../dtos/requests/workflow.create.dto';
import { UpdateWorkflowDto } from '../dtos/requests/workflow.update.dto';
import { WorkflowRequestDto } from '../dtos/requests/workflow.get.dto';
import { WorkflowResponseDto } from '../dtos/responses/workflow.response.dto';
import { WorkflowService } from '../services/workflow.service';

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @ApiEndpoint({
    summary: 'Create a workflow',
    httpStatus: HttpStatus.CREATED,
    serialization: WorkflowResponseDto,
  })
  createWorkflow(
    @Body() payload: CreateWorkflowDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.workflowService.createWorkflow(payload, user);
  }

  @Get()
  @ApiEndpoint({
    summary: 'Get workflows of current user',
    serialization: WorkflowResponseDto,
    paginated: true,
  })
  getWorkflows(
    @Query() query: WorkflowRequestDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.workflowService.getWorkflows(query, user);
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get workflow detail',
    serialization: WorkflowResponseDto,
  })
  getWorkflow(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.workflowService.getWorkflow(id, user);
  }

  @Patch(':id')
  @ApiEndpoint({
    summary: 'Update a workflow',
    serialization: WorkflowResponseDto,
  })
  updateWorkflow(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateWorkflowDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.workflowService.updateWorkflow(id, payload, user);
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Delete a workflow',
    message: 'Workflow deleted successfully',
  })
  deleteWorkflow(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.workflowService.deleteWorkflow(id, user);
  }
}
