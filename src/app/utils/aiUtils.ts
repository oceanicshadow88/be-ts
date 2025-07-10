import Anthropic from '@anthropic-ai/sdk';

export const tools: Anthropic.Tool[] = [
  {
    name: 'generate_feature_spec_template',
    description: '自动整理并生成标准化的功能需求模板，用于优化任务卡片说明',
    input_schema: {
      type: 'object',
      properties: {
        include_pass_test: {
          type: 'array',
          description: "说明该功能是否包含测试，是否要求通过测试。如果有特别说明，也可补充具体策略或约定，例如：\n- 是，包含并通过测试\n- 否，本阶段不需要测试\n- 暂时使用旧模板逻辑验证即可\n- 仅要求手动测试验证通过\n如无要求请写 'n/a'",
          items: {
            type: 'string',
            description: '单条技术细节说明',
          },
        },
        url_page: {
          type: 'string',
          description: "相关页面或功能模块的路径，例如 '/task/create', 或者url地址",
        },
        limitation: {
          type: 'array',
          description: "功能或者实现上的限制，比如'只适用于 PC'，'必须登录后才能使用'等，如果没有限制就写 n/a",
          items: {
            type: 'string',
            description: '单条技术细节说明',
          },
        },
        effect_related_functions: {
          type: 'array',
          description: "功能会影响或关联的其他模块，例如 '影响用户资料页显示逻辑'，没有就写'n/a'",
          items: {
            type: 'string',
            description: '单条技术细节说明',
          },
        },
        technical_details: {
          type: 'array',
          description: "开发或 QA 需要注意的技术细节，例如接口名称、依赖库、字段名等，没有就写'n/a'",
          items: {
            type: 'string',
            description: '单条技术细节说明',
          },
        },
        description: {
          type: 'string',
          description: "用用户故事（User Story）形式写的描述，例如：'As a user, I want to filter tasks by status, so that I can focus on unfinished work.'比如：As a registered user，I want to reset my password So that I can regain access if I forget it",
        },
        acceptance_criteria: {
          type: 'array',
          description: '验收标准，每条必须包含 GIVEN / WHEN / THEN / AND 四部分内容。',
          items: {
            type: 'object',
            properties: {
              given: {
                type: 'string',
                description: '前置条件（GIVEN）',
              },
              when: {
                type: 'string',
                description: '触发动作（WHEN）',
              },
              then: {
                type: 'string',
                description: '预期结果（THEN）',
              },
              and: {
                type: 'string',
                description: '附加结果或延伸结果（AND）',
              },
            },
            required: ['given', 'when', 'then', 'and'],
          },
        },
      },
      required: [
        'include_pass_test',
        'url_page', 
        'limitation',
        'effect_related_functions',
        'technical_details',
        'description',
        'acceptance_criteria',
      ],
      additionalProperties: false,
    },
  },
];

export const getSystemPrompt = (action: string): string => {
  switch (action) {
    case 'generate_feature_spec_template':
      return '你是一个经验丰富的产品经理，请根据用户的需求，生成一个标准化的功能需求模板。';
    default:
      return '你是一个专业的AI助手，请根据用户的需求提供有用的帮助和建议。';
  }
};

export const getToolChoice = (action: string): Anthropic.ToolChoice => {
  switch (action) {
    case 'generate_feature_spec_template':
      return { type: 'tool', name: action };
    default:
      return { type: 'auto' };
  }
}; 