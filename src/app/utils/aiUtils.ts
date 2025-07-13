import Anthropic from '@anthropic-ai/sdk';

export const tools: Anthropic.Tool[] = [
  {
    name: 'optimizeTicketDescription',
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

const systemPrompt = {
  optimizeTicketDescription: `你是一个严谨的结构化文档生成助手，还是一个经验丰富的BA，负责将用户输入的信息填充为一份标准的功能说明模板。
              请遵循以下规则：
              <规则>
                - 对每个字段（如 INCLUDE/PASS TEST、URL/PAGE 等）都必须保留字段名，即使用户没有提供内容，也要显示该字段并填入"n/a"；
                - 如果用户的输入中使用的是中文，请用中文回复；如果是英文，则用英文回复；若中英文混杂，则按照用户的语言风格混合输出；
                - 每个字段下的内容尽量使用列表的形式简洁列出，若内容为描述性表达，也应保留其原始语言风格与细节；
                - 如果用户对某些字段给出的内容不完全标准（如语气词、说明性、模糊表达），也要尽量理解其意图并如实记录在相应字段；
                - 对于 Acceptance Criteria，必须将其结构化为包含 given / when / then / and 四个子字段的对象，并按顺序列出；
                - 绝不遗漏字段结构，保证输出内容符合功能文档要求的完整格式。
              </规则>
              输出内容必须完全符合用户定义的字段结构，不得添加额外属性。字段名、结构、层级必须与调用时保持一致。`,
  optimizeText: `You are an assistant helping users improve comments on task cards in a collaborative project management platform (like JIRA). 

                Given a user comment, your job is to rewrite it in a way that is:

                - Clear and easy to understand for teammates
                - Grammatically correct and well-structured
                - Respectful and professional in tone
                - Focused on communicating the intent or concern clearly

                Do not remove technical terms, but explain them if necessary. Keep the response short and focused, unless the original comment requires context expansion.

                Return only the improved version of the comment. Do not include explanations or commentary.`,
};


export const getSystemPrompt = (action?: string): string => {
  if (action && systemPrompt[action as keyof typeof systemPrompt]) {
    return systemPrompt[action as keyof typeof systemPrompt];
  }
  return '你是一个专业的AI助手，请根据用户的需求提供有用的帮助和建议。';
};

export const getToolChoice = (action?: string): Anthropic.ToolChoice => {
  switch (action) {
    case 'optimizeTicketDescription':
      return { type: 'tool', name: action };
    default:
      return { type: 'auto' };
  }
}; 

export const getTools = (action?: string): Anthropic.Tool[] => {
  switch (action) {
    case 'optimizeTicketDescription':
      return tools;
    default:
      return [];
  }
}; 
