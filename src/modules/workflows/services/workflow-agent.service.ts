import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AiService } from '@/common/ai/services/ai.service';
import { WorkflowGraph } from '@/common/database/entities';
import { BadGatewayException, ERROR_CODE } from '@/common/filters';
import {
  buildWorkflowAgentPrompt,
  WORKFLOW_EDGE_TYPE,
  WORKFLOW_NODE_TYPE,
} from '../constants/workflow-agent.prompt';
import { WorkflowGraphDto } from '../dtos/requests/workflow-graph.dto';
import { WorkflowChatMessageDto } from '../dtos/requests/workflow.chat.dto';
import { WorkflowChatResponseDto } from '../dtos/responses/workflow.chat.response.dto';
import { EWorkflowNodeShape } from '../enums';

interface WorkflowAgentOutput {
  reply?: unknown;
  graph?: unknown;
}

const NODE_SHAPES = new Set<string>(Object.values(EWorkflowNodeShape));

@Injectable()
export class WorkflowAgentService {
  private readonly logger = new Logger(WorkflowAgentService.name);

  constructor(private readonly aiService: AiService) {}

  async chat(
    graph: WorkflowGraph,
    messages: WorkflowChatMessageDto[],
  ): Promise<WorkflowChatResponseDto> {
    const response = await this.aiService.chat(
      [
        { role: 'system', content: buildWorkflowAgentPrompt(graph) },
        ...messages,
      ],
      { responseFormat: 'json', temperature: 0.2 },
    );

    return this.parseOutput(response.content);
  }

  private parseOutput(content: string): WorkflowChatResponseDto {
    const output = this.parseJson(content);

    if (typeof output.reply !== 'string' || !output.reply.trim()) {
      throw this.invalidResponse('missing reply', content);
    }

    if (output.graph === null || output.graph === undefined) {
      return { reply: output.reply, graph: null };
    }

    return { reply: output.reply, graph: this.toGraph(output.graph, content) };
  }

  private parseJson(content: string): WorkflowAgentOutput {
    const json = content
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    try {
      const parsed: unknown = JSON.parse(json);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('not an object');
      }
      return parsed as WorkflowAgentOutput;
    } catch {
      throw this.invalidResponse('not valid JSON', content);
    }
  }

  private toGraph(raw: unknown, content: string): WorkflowGraph {
    const dto = plainToInstance(WorkflowGraphDto, raw);
    const errors = validateSync(dto, { whitelist: true });

    if (errors.length) {
      throw this.invalidResponse('graph schema mismatch', content);
    }

    const nodeIds = new Set<string>();

    for (const node of dto.nodes) {
      if (nodeIds.has(node.id)) {
        throw this.invalidResponse(`duplicate node id ${node.id}`, content);
      }
      if (
        typeof node.data.label !== 'string' ||
        typeof node.data.shape !== 'string' ||
        !NODE_SHAPES.has(node.data.shape)
      ) {
        throw this.invalidResponse(`invalid node data ${node.id}`, content);
      }
      nodeIds.add(node.id);
    }

    const edgeIds = new Set<string>();

    for (const edge of dto.edges) {
      if (edgeIds.has(edge.id)) {
        throw this.invalidResponse(`duplicate edge id ${edge.id}`, content);
      }
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw this.invalidResponse(`dangling edge ${edge.id}`, content);
      }
      edgeIds.add(edge.id);
    }

    return {
      nodes: dto.nodes.map((node) => ({
        id: node.id,
        type: WORKFLOW_NODE_TYPE,
        data: { label: node.data.label, shape: node.data.shape },
      })),
      edges: dto.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: WORKFLOW_EDGE_TYPE,
        ...(typeof edge.data?.label === 'string' && {
          data: { label: edge.data.label },
        }),
      })),
    };
  }

  private invalidResponse(reason: string, content: string) {
    this.logger.warn(`Invalid AI workflow response (${reason}): ${content}`);
    return new BadGatewayException(ERROR_CODE.WORKFLOW_AI_INVALID_RESPONSE);
  }
}
