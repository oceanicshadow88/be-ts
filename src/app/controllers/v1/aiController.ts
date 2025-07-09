import { Request, Response } from 'express';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../config/openAi';

const tools = [
  {
    type: 'function',
    name: 'generate_feature_spec_template',
    description: '自动整理并生成标准化的功能需求模板，用于优化任务卡片说明',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        include_pass_test: {
          type: 'array',
          description:
            "说明该功能是否包含测试，是否要求通过测试。如果有特别说明，也可补充具体策略或约定，例如：\n- 是，包含并通过测试\n- 否，本阶段不需要测试\n- 暂时使用旧模板逻辑验证即可\n- 仅要求手动测试验证通过\n如无要求请写 'n/a'",
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
          description:
            '功能或者实现上的限制，比如“只适用于 PC”，“必须登录后才能使用”等，如果没有限制就写 n/a ',
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
          description:
            "开发或 QA 需要注意的技术细节，例如接口名称、依赖库、字段名等，没有就写'n/a'",
          items: {
            type: 'string',
            description: '单条技术细节说明',
          },
        },
        description: {
          type: 'string',
          description:
            "用用户故事（User Story）形式写的描述，例如：'As a user, I want to filter tasks by status, so that I can focus on unfinished work.'比如：As a registered user，I want to reset my password So that I can regain access if I forget it",
          additionalProperties: false,
        },
        acceptance_criteria: {
          type: 'array',
          description: '验收标准，每条必须包含 GIVEN / WHEN / THEN / AND 四部分内容。',
          items: {
            type: 'object',
            required: ['given', 'when', 'then', 'and'],
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
            additionalProperties: false,
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

export const formatTaskDescription = async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  // const input = [
  //   {
  //     role: 'user',
  //     content: "What's the weather like in Paris today?",
  //   },
  // ];

  const response = await client.responses.create({
    model: 'gpt-4.1',
    input: 'Write a one-sentence bedtime story about a unicorn.',
    tools,
  });

  console.log(response.output_text);

  return res.status(200).json();
};
