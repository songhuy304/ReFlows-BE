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
import { WORKFLOW_AGENT_JSON_SCHEMA } from '../constants/workflow-agent.schema';
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
      {
        responseFormat: 'json',
        jsonSchema: WORKFLOW_AGENT_JSON_SCHEMA,
        temperature: 0.2,
      },
    );

    return this.parseOutput(response.content, graph);
  }

  private parseOutput(
    content: string,
    currentGraph: WorkflowGraph,
  ): WorkflowChatResponseDto {
    const output = this.parseJson(content);

    if (typeof output.reply !== 'string' || !output.reply.trim()) {
      throw this.invalidResponse('missing reply', content);
    }

    if (output.graph === null || output.graph === undefined) {
      return { reply: output.reply, graph: null };
    }

    return {
      reply: output.reply,
      graph: this.toGraph(output.graph, content, currentGraph),
    };
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

  private toGraph(
    raw: unknown,
    content: string,
    currentGraph: WorkflowGraph,
  ): WorkflowGraph {
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

    this.assertGraphTopology(dto.nodes, dto.edges, content);

    const currentPositions = new Map(
      currentGraph.nodes
        .filter((node) => node.position)
        .map((node) => [node.id, node.position]),
    );

    return {
      nodes: dto.nodes.map((node) => {
        const position = currentPositions.get(node.id);

        return {
          id: node.id,
          type: WORKFLOW_NODE_TYPE,
          ...(position && { position }),
          data: { label: node.data.label, shape: node.data.shape },
        };
      }),
      edges: dto.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: WORKFLOW_EDGE_TYPE,
        ...(typeof edge.data?.label === 'string' &&
          edge.data.label.trim() && {
            data: { label: edge.data.label },
          }),
      })),
    };
  }

  private assertGraphTopology(
    nodes: WorkflowGraphDto['nodes'],
    edges: WorkflowGraphDto['edges'],
    content: string,
  ): void {
    const flowNodeIds = nodes
      .filter((node) => this.nodeShape(node) !== EWorkflowNodeShape.TEXT)
      .map((node) => node.id);

    if (!flowNodeIds.length) {
      throw this.invalidResponse('graph has no flow nodes', content);
    }

    const adjacency = new Map(
      flowNodeIds.map((id) => [id, new Set<string>()]),
    );
    const outgoingCount = new Map<string, number>();
    const labeledOutgoingCount = new Map<string, number>();

    for (const edge of edges) {
      if (edge.source === edge.target) {
        throw this.invalidResponse(`self-loop ${edge.id}`, content);
      }

      const sourceNeighbors = adjacency.get(edge.source);
      const targetNeighbors = adjacency.get(edge.target);

      if (!sourceNeighbors || !targetNeighbors) {
        throw this.invalidResponse(`text node on edge ${edge.id}`, content);
      }

      sourceNeighbors.add(edge.target);
      targetNeighbors.add(edge.source);
      outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);

      if (typeof edge.data?.label === 'string' && edge.data.label.trim()) {
        labeledOutgoingCount.set(
          edge.source,
          (labeledOutgoingCount.get(edge.source) ?? 0) + 1,
        );
      }
    }

    const visited = new Set<string>([flowNodeIds[0]]);
    const stack = [flowNodeIds[0]];

    while (stack.length) {
      const current = stack.pop();

      if (current == null) {
        continue;
      }

      for (const next of adjacency.get(current) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }

    if (visited.size !== flowNodeIds.length) {
      throw this.invalidResponse('disconnected graph', content);
    }

    for (const node of nodes) {
      const shape = this.nodeShape(node);

      if (shape === EWorkflowNodeShape.TEXT) {
        continue;
      }

      const outgoing = outgoingCount.get(node.id) ?? 0;

      if (shape === EWorkflowNodeShape.DIAMOND) {
        if (
          outgoing < 2 ||
          (labeledOutgoingCount.get(node.id) ?? 0) !== outgoing
        ) {
          throw this.invalidResponse(`invalid diamond ${node.id}`, content);
        }
        continue;
      }

      if (outgoing > 1) {
        throw this.invalidResponse(`fork on non-diamond ${node.id}`, content);
      }
    }
  }

  private nodeShape(node: WorkflowGraphDto['nodes'][number]): string {
    return typeof node.data.shape === 'string' ? node.data.shape : '';
  }

  private invalidResponse(reason: string, content: string) {
    this.logger.warn(`Invalid AI workflow response (${reason}): ${content}`);
    return new BadGatewayException(ERROR_CODE.WORKFLOW_AI_INVALID_RESPONSE);
  }
}
