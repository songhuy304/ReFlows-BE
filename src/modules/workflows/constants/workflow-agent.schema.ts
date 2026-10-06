import { AiJsonSchema } from '@/common/ai/interfaces';
import { EWorkflowNodeShape } from '../enums';
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_TYPE } from './workflow-agent.prompt';

const node = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'type', 'data'],
  properties: {
    id: { type: 'string' },
    type: { type: 'string', enum: [WORKFLOW_NODE_TYPE] },
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['label', 'shape'],
      properties: {
        label: { type: 'string' },
        shape: { type: 'string', enum: Object.values(EWorkflowNodeShape) },
      },
    },
  },
};

const edge = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'source', 'target', 'type', 'data'],
  properties: {
    id: { type: 'string' },
    source: { type: 'string' },
    target: { type: 'string' },
    type: { type: 'string', enum: [WORKFLOW_EDGE_TYPE] },
    data: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['label'],
      properties: { label: { type: 'string' } },
    },
  },
};

export const WORKFLOW_AGENT_JSON_SCHEMA: AiJsonSchema = {
  name: 'workflow_agent',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['reply', 'graph'],
    properties: {
      reply: { type: 'string' },
      graph: {
        type: ['object', 'null'],
        additionalProperties: false,
        required: ['nodes', 'edges'],
        properties: {
          nodes: { type: 'array', items: node },
          edges: { type: 'array', items: edge },
        },
      },
    },
  },
};
