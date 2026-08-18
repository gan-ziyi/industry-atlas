import type { ProjectState } from '../types'

export const demoProject: ProjectState = {
  projectTitle: 'AI 算力产业链',
  rootId: 'ai',
  nodes: {
    ai: { id: 'ai', title: 'AI 算力产业链', category: '产业总览', summary: '从能源、基础设施到模型与应用的完整算力价值链。', why: 'AI 的规模化落地同时受制于电力、芯片、互连、数据和商业化效率。', status: 'edited', children: ['energy', 'compute', 'network', 'model', 'application'], position: { x: 40, y: 280 } },
    energy: { id: 'energy', title: '能源与电力', category: '上游基础', summary: '为数据中心提供稳定、低成本和低碳电力。', why: '功率密度与并网能力正在成为算力扩张的硬约束。', status: 'evidenced', children: ['grid', 'cooling'], position: { x: 300, y: 40 }, metrics: ['PUE', '电价', '上架功率'] },
    grid: { id: 'grid', title: '电网与供配电', category: '能源基础设施', summary: '覆盖发电接入、变电、输配电和备用电源。', why: '决定园区可获得的电力容量和建设周期。', status: 'unresearched', children: [], position: { x: 590, y: 0 } },
    cooling: { id: 'cooling', title: '液冷与热管理', category: '数据中心设备', summary: '通过冷板或浸没方案处理高密度算力热量。', why: '机柜功率提升后，传统风冷的效率和空间受到限制。', status: 'ai_draft', children: [], position: { x: 590, y: 100 } },
    compute: { id: 'compute', title: '计算芯片', category: '核心硬件', summary: 'GPU、ASIC、CPU 及配套先进封装构成计算核心。', why: '性能、供给与软件生态共同决定训练和推理成本。', status: 'verified', children: ['gpu', 'memory'], position: { x: 300, y: 220 }, metrics: ['算力', '带宽', '功耗'] },
    gpu: { id: 'gpu', title: 'GPU / AI ASIC', category: '计算芯片', summary: '承担模型训练和推理的并行计算。', why: '是算力集群资本开支中价值量最高的环节。', status: 'evidenced', children: [], position: { x: 590, y: 190 } },
    memory: { id: 'memory', title: 'HBM 与存储', category: '存储芯片', summary: '提供高带宽内存及数据存储。', why: '带宽和堆叠良率会直接限制加速器利用率。', status: 'edited', children: [], position: { x: 590, y: 290 }, bottlenecks: ['先进封装', '良率'] },
    network: { id: 'network', title: '高速互连', category: '网络基础设施', summary: '连接服务器、交换机和算力集群。', why: '集群规模扩大后，通信效率决定有效算力。', status: 'evidenced', children: ['optical', 'switch'], position: { x: 300, y: 400 } },
    optical: { id: 'optical', title: '光模块', category: '光通信', summary: '完成高速电光与光电转换。', why: '带宽升级推动 800G、1.6T 光模块价值量提升。', status: 'verified', children: [], position: { x: 590, y: 390 }, metrics: ['速率', '功耗', '良率'] },
    switch: { id: 'switch', title: '交换芯片与设备', category: '网络设备', summary: '完成集群内部流量交换与调度。', why: '拓扑和拥塞控制影响大规模训练效率。', status: 'ai_draft', children: [], position: { x: 590, y: 490 } },
    model: { id: 'model', title: '模型与平台', category: '中游平台', summary: '基础模型、开发平台与推理服务。', why: '连接底层算力供给与具体业务需求。', status: 'edited', children: [], position: { x: 300, y: 580 } },
    application: { id: 'application', title: '行业应用', category: '下游应用', summary: '办公、软件、制造、医疗和消费应用。', why: '商业化收入最终决定产业链资本投入的可持续性。', status: 'unresearched', children: [], position: { x: 300, y: 700 } },
  },
  edges: [],
  companyData: [],
  evidenceData: { optical: [{ id: 'ev-1', type: 'PDF', title: 'AI 基础设施行业研究', location: '第 28 页', quote: '高速互联需求随 AI 集群规模和带宽要求提升。', verified: true }] },
  researchTasks: [
    { id: 'task-1', nodeId: 'memory', title: '补充 HBM 供给与价格数据', status: 'doing', priority: 'high' },
    { id: 'task-2', nodeId: 'application', title: '拆解 AI 应用商业化路径', status: 'todo', priority: 'medium' },
  ],
}
