const nodes = {
  ai: { title: 'AI 产业', desc: '从基础设施到应用', x: 40, y: 292, type: 'core', icon: 'AI', children: ['energy','compute','model','apps'], category: '产业总览 · 研究主题', summary: '围绕人工智能训练、推理与应用形成的技术和商业体系。', why: 'AI 产业的价值并非只集中在模型或芯片，而是沿能源、算力、工具链和应用逐层传导。' },
  energy: { title: '能源与数据中心', desc: '电力、机房与基础设施', x: 260, y: 72, type:'core', icon:'⚡', children:[], category:'AI 产业 · 上游基础设施', summary:'为 AI 集群提供电力、空间、制冷和持续运行能力。', why:'算力密度持续上升，使电力获取、供配电和散热成为数据中心扩张的重要约束。' },
  compute: { title: '算力基础设施', desc: '芯片、服务器与互联', x:260,y:222,type:'core',icon:'◇',children:['semiconductor','server','network','cooling'],category:'AI 产业 · 核心基础设施',summary:'承载模型训练和推理所需计算、存储、网络与系统能力。',why:'模型规模和使用量的增长最终会转化为计算、存储、网络和能耗需求。' },
  model: { title:'模型与开发工具',desc:'基础模型、框架与平台',x:260,y:372,type:'core',icon:'M',children:[],category:'AI 产业 · 中游能力层',summary:'将底层算力转化为可训练、可部署和可调用的智能能力。',why:'模型能力与工程工具共同决定算力能否有效转化为产品能力。' },
  apps: { title:'AI 应用',desc:'行业软件与智能终端',x:260,y:522,type:'core',icon:'↗',children:[],category:'AI 产业 · 下游应用层',summary:'面向消费者和行业客户交付实际价值的产品与服务。',why:'应用需求决定推理算力消耗，并反向影响模型和基础设施的技术路线。' },
  semiconductor:{title:'半导体',desc:'计算、存储、制造与封装',x:488,y:128,type:'segment',icon:'▧',children:['accelerator','memory','fab','packaging','chiplink'],category:'算力基础设施 · 核心环节',summary:'提供计算、存储和数据交换所需的核心芯片，并依赖制造与封装完成量产。',why:'AI 系统的性能、成本和供给能力很大程度上由芯片架构、制程、存储和封装共同决定。'},
  server:{title:'AI 服务器',desc:'整机、主板与系统集成',x:488,y:244,type:'segment',icon:'▥',children:[],category:'算力基础设施 · 系统层',summary:'将加速卡、CPU、内存、网络、电源和散热集成为可部署的计算节点。',why:'服务器是零部件进入数据中心的载体，决定系统交付节奏和整机价值分配。'},
  network:{title:'网络互联',desc:'集群内高速数据传输',x:488,y:360,type:'segment',icon:'⌘',children:['switchchip','optical','copper'],category:'算力基础设施 · 核心环节',summary:'连接 GPU、服务器和机柜，使大规模计算节点能够协同工作。',why:'集群规模越大，通信开销越可能成为有效算力的限制因素。'},
  cooling:{title:'供电与散热',desc:'电源、液冷与热管理',x:488,y:476,type:'segment',icon:'◌',children:[],category:'算力基础设施 · 配套环节',summary:'为高功率计算设备提供稳定电力并带走运行产生的热量。',why:'单机柜功率密度上升推动供电架构升级，也使液冷渗透率持续提高。'},
  accelerator:{title:'计算芯片',desc:'GPU、ASIC 与 CPU',x:720,y:64,type:'segment',icon:'C',children:[],category:'半导体 · 计算芯片',summary:'执行模型训练和推理中的大规模矩阵及并行计算任务。',why:'计算芯片决定单卡性能，但实际系统效率还受到存储、互联和软件生态影响。'},
  memory:{title:'存储芯片',desc:'HBM、DRAM 与 NAND',x:720,y:145,type:'segment',icon:'▤',children:[],category:'半导体 · 存储环节',summary:'保存模型参数、中间结果与训练数据，为计算芯片持续提供数据。',why:'算力提升快于数据供给速度时，内存带宽会成为限制芯片利用率的关键瓶颈。'},
  fab:{title:'晶圆制造',desc:'先进制程与成熟制程',x:720,y:226,type:'segment',icon:'◎',children:[],category:'半导体 · 制造环节',summary:'通过晶圆加工工艺将芯片设计转化为可量产的实体芯片。',why:'先进制程产能、良率和设备能力影响高端 AI 芯片的供应规模与成本。'},
  packaging:{title:'先进封装',desc:'2.5D、3D 与 Chiplet',x:720,y:307,type:'segment',icon:'▦',children:[],category:'半导体 · 封装环节',summary:'将计算芯片、HBM 等高性能器件高密度集成在同一封装系统内。',why:'先进封装不仅完成连接，也直接影响带宽、功耗、散热与最终产能。'},
  chiplink:{title:'芯片互联',desc:'SerDes、总线与接口',x:720,y:388,type:'segment',icon:'⇄',children:[],category:'半导体 · 互联环节',summary:'负责芯片内部、芯片之间及芯片与系统之间的数据传输。',why:'高速互联决定多个计算单元能否高效扩展，并影响集群的有效计算能力。'},
  switchchip:{title:'交换芯片',desc:'控制网络数据转发',x:720,y:410,type:'segment',icon:'S',children:[],category:'网络互联 · 核心器件',summary:'决定网络设备如何高速、低延迟地转发集群中的数据。',why:'大规模训练会产生高强度东西向流量，交换能力影响节点间协作效率。'},
  optical:{title:'光模块',desc:'电信号与光信号转换',x:720,y:491,type:'segment',icon:'◈',children:[],category:'网络互联 · 核心环节',summary:'在交换设备与服务器之间完成电信号和光信号转换，是 AI 集群高速互联的关键器件。',why:'大规模模型训练依赖数千张 GPU 协同工作。算力规模越大，服务器间的数据传输压力越高，高速光连接需求也随之提升。'},
  copper:{title:'铜连接',desc:'短距离高速电连接',x:720,y:572,type:'segment',icon:'≈',children:[],category:'网络互联 · 连接方案',summary:'在较短距离内以较低成本和功耗完成服务器及机柜内高速连接。',why:'在适用距离内，铜连接具备成本和功耗优势，并与光连接形成分工和替代关系。'},
  cpo:{title:'CPO 共封装光学',desc:'AI 建议新增节点',x:948,y:462,type:'draft',icon:'✦',children:[],category:'网络互联 · AI 建议',summary:'将光引擎靠近或集成到交换芯片封装附近，缩短信号传输路径。',why:'传统可插拔光模块在更高速率下面临功耗和信号完整性挑战，CPO 是潜在演进路线。'},
  silicon:{title:'硅光芯片',desc:'AI 建议新增节点',x:948,y:543,type:'draft',icon:'✦',children:[],category:'光模块上游 · AI 建议',summary:'利用硅基工艺集成部分光学器件，实现更高程度的光电集成。',why:'高速率光通信推动更高集成度、更低成本与更低功耗的光学方案。'}
};

const edges = [
  ...['energy','compute','model','apps'].map(target=>({source:'ai',target,type:'structure'})),
  ...['semiconductor','server','network','cooling'].map(target=>({source:'compute',target,type:'structure'})),
  ...['accelerator','memory','fab','packaging','chiplink'].map(target=>({source:'semiconductor',target,type:'structure'})),
  ...['switchchip','optical','copper'].map(target=>({source:'network',target,type:'structure'})),
  {source:'memory',target:'accelerator',type:'supply'},
  {source:'packaging',target:'accelerator',type:'constraint'},
  {source:'switchchip',target:'optical',type:'depend'},
  {source:'cpo',target:'optical',type:'constraint',draft:true,draftPatch:'link-cpo'},
  {source:'silicon',target:'optical',type:'supply',draft:true,draftPatch:'add-silicon'}
];

const STORAGE_KEY = 'industry-atlas-workspace-v1';
const PROJECTS_KEY = 'industry-atlas-projects-v1';
const AI_CONFIG_KEY = 'industry-atlas-ai-config-v1';
const API_KEY_SESSION = 'industry-atlas-api-key-session';
const CLOUD_CONFIG_KEY = 'industry-atlas-cloud-config-v1';
const CLOUD_TOKEN_SESSION = 'industry-atlas-cloud-token-session';
const CLOUD_WORKSPACE_SESSION = 'industry-atlas-cloud-workspace-session';
const CLOUD_PROJECT_MAP_KEY = 'industry-atlas-cloud-project-map-v1';
let savedState = null;
try { savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) { savedState = null; }

if (savedState?.nodes) Object.assign(nodes, savedState.nodes);
if (Array.isArray(savedState?.edges)) edges.splice(0, edges.length, ...savedState.edges);
edges.forEach(edge=>{if(edge.draft&&!edge.draftPatch)edge.draftPatch=edge.source==='cpo'?'link-cpo':edge.source==='silicon'?'add-silicon':undefined;});

let expanded = new Set(savedState?.expanded || ['ai','compute','network']);
let selected = savedState?.selected && nodes[savedState.selected] ? savedState.selected : 'optical';
let currentMode = 'browse';
let zoom = Number.isFinite(savedState?.zoom) ? savedState.zoom : .9;
let reviewVisible = false;
let draftAccepted = Boolean(savedState?.draftAccepted);
let nodePositions = savedState?.nodePositions || Object.fromEntries(Object.entries(nodes).map(([id,n])=>[id,{x:n.x,y:n.y}]));
let researchData = savedState?.researchData || {};
let history = Array.isArray(savedState?.history) ? savedState.history : [];
let evidenceData = savedState?.evidenceData || {optical:[
  {id:'src_demo_1',type:'PDF',title:'AI Infrastructure Industry Report',url:'',date:'2026-07-10',location:'第 28 页',quote:'高速互联需求随 AI 集群规模和带宽要求提升。',verified:true},
  {id:'src_demo_2',type:'WEB',title:'高速互联技术路线更新',url:'',date:'2026-07-18',location:'行业资料',quote:'可插拔光模块、硅光和 CPO 构成不同阶段的技术路线。',verified:false}
]};
let researchTasks = Array.isArray(savedState?.researchTasks)?savedState.researchTasks:[
  {id:'task_demo_1',nodeId:'optical',title:'核验光模块需求增长的核心逻辑',type:'verify',priority:'high',status:'doing',note:'补充可引用的行业资料，并确认带宽、距离和功耗三个驱动因素。',createdAt:'2026-08-05T08:00:00.000Z'},
  {id:'task_demo_2',nodeId:'memory',title:'补充 HBM 关键指标与供给瓶颈',type:'evidence',priority:'medium',status:'todo',note:'研究带宽、堆叠层数、良率和先进封装产能。',createdAt:'2026-08-05T08:10:00.000Z'}
];
let companyData=Array.isArray(savedState?.companyData)?savedState.companyData:[];
let activeCompanyId=companyData[0]?.id||null;
companyData.forEach(company=>{company.documents=company.documents||[];company.findings=company.findings||[];company.mappings=company.mappings||[];company.periods=company.periods||[];company.findings.forEach(finding=>{finding.reportPeriod=finding.reportPeriod||company.reportPeriod||''});});
let companyCompareSelection=new Set();
let mappingReviewSelection=new Set();
let compareSelection=new Set();
let acceptedPatchIds = new Set(savedState?.acceptedPatchIds || (savedState?.draftAccepted?['add-cpo','add-silicon','change-optical','link-cpo']:[]));
let currentProjectId = savedState?.projectId || 'ai-compute';
let projectTitle = savedState?.projectTitle || 'AI 算力产业链';
let rootId = savedState?.rootId || 'ai';
function ensureNodeMetadata(){Object.entries(nodes).forEach(([id,node])=>{node.status=node.status||(id==='optical'?'evidenced':'unresearched');node.updatedAt=node.updatedAt||null;node.citations=node.citations||{summary:[],why:[]};});}
ensureNodeMetadata();
let apiConfig = (()=>{
  const defaults={mode:'demo',provider:'deepseek',protocol:'chat',baseUrl:'https://api.deepseek.com',model:'deepseek-v4-flash',reasoningEffort:'medium',timeout:60000};
  try{const stored=JSON.parse(localStorage.getItem(AI_CONFIG_KEY)||'{}');if(stored.baseUrl&&!stored.provider)stored.provider=stored.baseUrl.includes('deepseek')?'deepseek':stored.protocol==='responses'?'openai':'custom';return {...defaults,...stored}}catch(_){return defaults}
})();
let cloudConfig=(()=>{try{return {baseUrl:'http://127.0.0.1:8000',...JSON.parse(localStorage.getItem(CLOUD_CONFIG_KEY)||'{}')}}catch(_){return {baseUrl:'http://127.0.0.1:8000'}}})();
let cloudSyncTimer=null;
let lastProcessedDocument=null,currentExtraction=null;
let libraryView='sources',documentTaskCache=[],currentDocumentTables=[],currentTableDocument=null;

const nodeLayer = document.querySelector('#nodeLayer');
const edgeLayer = document.querySelector('#edgeLayer');
const world = document.querySelector('#graphWorld');
const toast = document.querySelector('#toast');

function cloudToken(){return sessionStorage.getItem(CLOUD_TOKEN_SESSION)||'';}
function cloudWorkspace(){try{return JSON.parse(sessionStorage.getItem(CLOUD_WORKSPACE_SESSION)||'null')}catch(_){return null}}
function cloudProjectMap(){try{return JSON.parse(localStorage.getItem(CLOUD_PROJECT_MAP_KEY)||'{}')}catch(_){return {}}}
function cloudMapKey(){return `${cloudConfig.baseUrl}|${cloudWorkspace()?.id||''}|${currentProjectId}`;}
function mappedCloudProjectId(){return cloudProjectMap()[cloudMapKey()]||'';}
function saveBackendUrl(){const input=document.querySelector('#backendUrl'),value=(input?.value||cloudConfig.baseUrl).trim().replace(/\/+$/,'');if(value){cloudConfig.baseUrl=value;localStorage.setItem(CLOUD_CONFIG_KEY,JSON.stringify(cloudConfig));}return cloudConfig.baseUrl;}
async function cloudRequest(path,{method='GET',body,headers={},auth=true}={}){
  const base=saveBackendUrl(),requestHeaders={...headers};if(auth){const token=cloudToken();if(!token)throw new Error('请先登录研究空间');requestHeaders.Authorization=`Bearer ${token}`;}let requestBody=body;if(body&&!(body instanceof Blob)&&!(body instanceof ArrayBuffer)){requestHeaders['Content-Type']='application/json';requestBody=JSON.stringify(body);}const response=await fetch(`${base}${path}`,{method,headers:requestHeaders,body:requestBody});const text=await response.text();let data=null;try{data=text?JSON.parse(text):null}catch(_){data=text}if(!response.ok)throw new Error(data?.detail||`后端返回 ${response.status}`);return data;
}
function refreshCloudChrome(){
  const session=cloudWorkspace(),connected=Boolean(cloudToken()&&session),state=document.querySelector('#cloudState'),sync=document.querySelector('#syncProject'),footer=document.querySelector('#cloudStatus');if(state){state.classList.toggle('connected',connected);state.querySelector('strong').textContent=connected?`已连接：${session.name}`:'尚未连接后端';state.querySelector('small').textContent=connected?`空间 ID：${session.id}${mappedCloudProjectId()?' · 当前项目已建立云端映射':' · 当前项目尚未同步'}`:'先启动本地 FastAPI 服务，再使用开发登录。';document.querySelector('#cloudWorkspaceName').value=connected?session.name:'尚未登录';}if(sync){sync.disabled=!connected;sync.textContent=mappedCloudProjectId()?'立即同步当前项目':'首次上传当前项目';}if(footer){footer.querySelector('.sync-dot').classList.toggle('cloud',connected);footer.querySelector('span:last-child').textContent=connected?(mappedCloudProjectId()?'本地与云端已连接':'已登录 · 项目待同步'):'本地修改已保存';}
}
function openCloud(){document.querySelector('#backendUrl').value=cloudConfig.baseUrl;document.querySelector('#cloudResult').className='connection-result';document.querySelector('#cloudResult').textContent=cloudToken()?'可以同步当前项目或上传 PDF。':'当前项目仍只保存在浏览器本地。';refreshCloudChrome();document.querySelector('#cloudModal').classList.add('open');document.querySelector('#cloudModal').setAttribute('aria-hidden','false');}
function closeCloud(){document.querySelector('#cloudModal').classList.remove('open');document.querySelector('#cloudModal').setAttribute('aria-hidden','true');}
async function testBackendConnection(){const result=document.querySelector('#cloudResult'),button=document.querySelector('#testBackend');button.disabled=true;result.className='connection-result';result.textContent='正在检查后端…';try{const data=await cloudRequest('/api/health',{auth:false});result.className='connection-result success';result.textContent=`连接成功：${data.service}`;}catch(error){result.className='connection-result error';result.textContent=`连接失败：${error.message}。请确认后端已经启动。`;}finally{button.disabled=false;}}
async function devCloudLogin(){const result=document.querySelector('#cloudResult'),button=document.querySelector('#devLogin'),displayName=document.querySelector('#devDisplayName').value.trim();if(!displayName){showToast('请输入开发登录名称');return;}button.disabled=true;result.textContent='正在创建本地开发会话…';try{const data=await cloudRequest('/api/auth/dev-login',{method:'POST',body:{display_name:displayName},auth:false});sessionStorage.setItem(CLOUD_TOKEN_SESSION,data.token);sessionStorage.setItem(CLOUD_WORKSPACE_SESSION,JSON.stringify({id:data.workspace_id,name:`${data.user.display_name}的研究空间`,user:data.user}));result.className='connection-result success';result.textContent='开发登录成功，可以同步当前项目。';refreshCloudChrome();}catch(error){result.className='connection-result error';result.textContent=`登录失败：${error.message}`;}finally{button.disabled=false;}}
function logoutCloud(){sessionStorage.removeItem(CLOUD_TOKEN_SESSION);sessionStorage.removeItem(CLOUD_WORKSPACE_SESSION);refreshCloudChrome();document.querySelector('#cloudResult').className='connection-result';document.querySelector('#cloudResult').textContent='已退出本地会话，浏览器中的项目仍然保留。';}
async function syncCurrentProject({silent=false,skipCompanyMaster=false}={}){
  const session=cloudWorkspace();if(!cloudToken()||!session){if(!silent)openCloud();throw new Error('请先登录研究空间');}const button=document.querySelector('#syncProject');if(button)button.disabled=true;const map=cloudProjectMap(),key=cloudMapKey(),cloudId=map[key],payload={title:projectTitle,state:currentWorkspaceState()};try{let project;if(cloudId)project=await cloudRequest(`/api/projects/${encodeURIComponent(cloudId)}`,{method:'PUT',body:payload});else{project=await cloudRequest('/api/projects',{method:'POST',body:{workspace_id:session.id,...payload}});map[key]=project.id;localStorage.setItem(CLOUD_PROJECT_MAP_KEY,JSON.stringify(map));}if(!skipCompanyMaster)pushWorkspaceCompanyMaster(project.id).catch(()=>{});refreshCloudChrome();const result=document.querySelector('#cloudResult');if(result&&document.querySelector('#cloudModal').classList.contains('open')){result.className='connection-result success';result.textContent=`“${projectTitle}”已同步，云端项目 ID：${project.id}`;}if(!silent)showToast('当前项目已同步到后端');return project;}catch(error){refreshCloudChrome();if(!silent)showToast(`同步失败：${error.message}`);throw error;}finally{if(button)button.disabled=!cloudToken();}
}
function scheduleCloudSync(){if(!cloudToken()||!mappedCloudProjectId())return;clearTimeout(cloudSyncTimer);cloudSyncTimer=setTimeout(()=>syncCurrentProject({silent:true}).catch(()=>{const footer=document.querySelector('#cloudStatus span:last-child');if(footer)footer.textContent='云端同步失败 · 点击检查'}),1400);}
function setDocumentProgress(step,percent,message){document.querySelector('#documentBar').style.width=`${percent}%`;document.querySelector('#documentMessage').textContent=message;document.querySelectorAll('#documentSteps>div').forEach((item,index)=>{item.classList.toggle('active',index===step-1);item.classList.toggle('done',index<step-1)});}
function openDocumentProgress(file){document.querySelector('#documentName').textContent=file.name;document.querySelector('#documentMeta').textContent=`${(file.size/1024/1024).toFixed(2)} MB · 将关联至“${nodes[selected].title}”`;document.querySelector('#documentDone').disabled=true;document.querySelector('#documentDone').textContent='处理中';document.querySelector('#documentExtract').disabled=true;document.querySelector('#documentBar').style.background='';setDocumentProgress(1,8,'准备上传到研究空间……');document.querySelector('#documentModal').classList.add('open');document.querySelector('#documentModal').setAttribute('aria-hidden','false');}
function closeDocumentProgress(){document.querySelector('#documentModal').classList.remove('open');document.querySelector('#documentModal').setAttribute('aria-hidden','true');}
const waitMs=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function uploadPdfFile(file){
  if(!file)return;if(!cloudToken()||!cloudWorkspace()){showToast('上传 PDF 前需要先连接后端');openCloud();return;}if(file.type&&file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){showToast('请选择 PDF 文件');return;}const targetNode=selected;closeBrowserModal('#libraryModal');openDocumentProgress(file);
  try{const project=await syncCurrentProject({silent:true});setDocumentProgress(1,28,'正在上传 PDF……');const session=cloudWorkspace(),bytes=await file.arrayBuffer(),uploadedDocument=await cloudRequest(`/api/documents?workspace_id=${encodeURIComponent(session.id)}&project_id=${encodeURIComponent(project.id)}`,{method:'POST',body:bytes,headers:{'Content-Type':'application/pdf','X-Filename':encodeURIComponent(file.name)}});setDocumentProgress(2,48,'文件已上传，正在提取页码和文本……');let status=null;for(let attempt=0;attempt<60;attempt++){status=await cloudRequest(`/api/documents/${encodeURIComponent(uploadedDocument.id)}`);if(status.status==='ready'||status.status==='failed')break;await waitMs(1000);}if(!status||status.status==='processing')throw new Error('解析仍在后台进行，请稍后从资料库重新查看');if(status.status==='failed')throw new Error(status.error||'PDF 解析失败');const chunks=await cloudRequest(`/api/documents/${encodeURIComponent(uploadedDocument.id)}/chunks`);setDocumentProgress(3,82,'文本已提取，正在回填当前节点资料……');createSnapshot(`上传并解析“${file.name}”`);const list=evidenceData[targetNode]||(evidenceData[targetNode]=[]),firstText=chunks.find(chunk=>chunk.text?.trim())?.text?.trim()||'未提取到可复制文本；该文件可能是扫描件，需要后续 OCR。';list.push({id:`source_doc_${Date.now()}`,type:'PDF',title:file.name,url:`backend-document:${uploadedDocument.id}`,date:new Date().toISOString().slice(0,10),location:`${status.page_count} 页 · 后端文档 ${uploadedDocument.id}`,quote:firstText.slice(0,500),verified:false,documentId:uploadedDocument.id,cloudProjectId:project.id});lastProcessedDocument={id:uploadedDocument.id,filename:file.name,nodeId:targetNode,cloudProjectId:project.id,pageCount:status.page_count,charCount:status.char_count};nodes[targetNode].status='evidenced';nodes[targetNode].updatedAt=new Date().toISOString();selected=targetNode;updateDetail(targetNode);render();saveState('PDF 已解析并回填为节点资料');await syncCurrentProject({silent:true});setDocumentProgress(3,100,`解析完成：${status.page_count} 页，提取 ${status.char_count.toLocaleString()} 个字符。`);document.querySelector('#documentExtract').disabled=status.char_count===0;document.querySelector('#documentDone').disabled=false;document.querySelector('#documentDone').textContent='完成';
  }catch(error){setDocumentProgress(2,100,`处理失败：${error.message}`);document.querySelector('#documentBar').style.background='#d66a62';document.querySelector('#documentDone').disabled=false;document.querySelector('#documentDone').textContent='关闭';}
}

function closeExtraction(){document.querySelector('#extractionModal').classList.remove('open');document.querySelector('#extractionModal').setAttribute('aria-hidden','true');}
function updateExtractionSelection(event){if(!currentExtraction?.result)return;if(!currentExtraction.selectedIds)currentExtraction.selectedIds=new Set((currentExtraction.result.findings||[]).filter(item=>item.citation_status==='matched').map(item=>item.id));if(event?.target){if(event.target.checked)currentExtraction.selectedIds.add(event.target.value);else currentExtraction.selectedIds.delete(event.target.value);}const checked=currentExtraction.selectedIds.size,total=(currentExtraction.result.findings||[]).length;document.querySelector('#extractionSelected').textContent=`已选择 ${checked}/${total} 条发现`;document.querySelector('#acceptExtraction').disabled=checked===0;}
function renderExtractionFindings(){
  const result=currentExtraction?.result;if(!result)return;const category=document.querySelector('#extractionCategory').value,items=(result.findings||[]).filter(item=>category==='all'||item.category===category);document.querySelector('#extractionCompany').textContent=result.company||lastProcessedDocument?.filename||'未识别公司';document.querySelector('#extractionPeriod').textContent=result.report_period||'报告期未识别';document.querySelector('#extractionSummaryText').textContent=result.summary||'已完成结构化提取，请逐项核对。';const validation=result.validation||{matched:0,total:items.length,unmatched:0},badge=document.querySelector('#extractionValidation');badge.className=validation.unmatched?'warning':'';badge.textContent=`原文匹配 ${validation.matched}/${validation.total}`;
  if(!currentExtraction.selectedIds)currentExtraction.selectedIds=new Set((result.findings||[]).filter(item=>item.citation_status==='matched').map(item=>item.id));document.querySelector('#extractionList').innerHTML=items.length?items.map(item=>`<article class="extraction-item ${escapeHtml(item.citation_status)}"><input type="checkbox" value="${escapeHtml(item.id)}" ${currentExtraction.selectedIds.has(item.id)?'checked':''}/><span class="finding-category">${escapeHtml(item.category_label||item.category)}</span><div class="finding-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.value)}</span><small>原文：${escapeHtml(item.quote||'模型未提供原文')}</small></div><div class="finding-check ${escapeHtml(item.citation_status)}"><b>${item.citation_status==='matched'?'✓ 原文匹配':'! 待人工核对'}</b><small>${(item.page_numbers||[]).length?`第 ${item.page_numbers.join('、')} 页`:'无有效页码'}<br/>置信度 ${Math.round((item.confidence||0)*100)}%</small></div></article>`).join(''):'<div class="empty-state">当前分类没有提取结果</div>';document.querySelectorAll('#extractionList input').forEach(input=>input.addEventListener('change',updateExtractionSelection));updateExtractionSelection();
}
async function startDocumentExtraction(){
  if(!lastProcessedDocument){showToast('请先上传并解析一份 PDF');return;}closeDocumentProgress();const modal=document.querySelector('#extractionModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.querySelector('#extractionList').innerHTML='<div class="empty-state">DeepSeek 正在阅读页码级原文并生成结构化发现……</div>';document.querySelector('#acceptExtraction').disabled=true;document.querySelector('#extractionSelected').textContent='提取任务处理中';
  try{const task=await cloudRequest(`/api/documents/${encodeURIComponent(lastProcessedDocument.id)}/extractions`,{method:'POST',body:{model:'deepseek-v4-flash'}});let extraction=null;for(let attempt=0;attempt<180;attempt++){extraction=await cloudRequest(`/api/document-extractions/${encodeURIComponent(task.id)}`);if(extraction.status==='ready'||extraction.status==='failed')break;await waitMs(1000);}if(!extraction||extraction.status==='processing')throw new Error('DeepSeek 仍在后台处理，请稍后重试');if(extraction.status==='failed')throw new Error(extraction.error||'年报提取失败');currentExtraction=extraction;renderExtractionFindings();}catch(error){document.querySelector('#extractionList').innerHTML=`<div class="empty-state">提取失败：${escapeHtml(error.message)}</div>`;document.querySelector('#extractionSelected').textContent='没有可写入的结果';}
}
function acceptExtractionFindings(){
  if(!currentExtraction?.result||!lastProcessedDocument)return;const ids=new Set([...document.querySelectorAll('#extractionList input:checked')].map(input=>input.value)),findings=currentExtraction.result.findings.filter(item=>ids.has(item.id));if(!findings.length)return;const nodeId=lastProcessedDocument.nodeId;if(!nodes[nodeId]){showToast('原关联节点已不存在');return;}createSnapshot(`写入“${lastProcessedDocument.filename}”年报提取结果`);const list=evidenceData[nodeId]||(evidenceData[nodeId]=[]);findings.forEach(item=>{if(list.some(source=>source.extractionId===currentExtraction.id&&source.findingId===item.id))return;list.push({id:`source_ext_${Date.now()}_${item.id}`,type:'ANNUAL',title:`${lastProcessedDocument.filename} · ${item.title}`,url:`backend-document:${lastProcessedDocument.id}`,date:new Date().toISOString().slice(0,10),location:(item.matched_pages||item.page_numbers||[]).length?`第 ${(item.matched_pages||item.page_numbers).join('、')} 页`:'页码待核对',quote:item.quote||item.value,verified:false,documentId:lastProcessedDocument.id,extractionId:currentExtraction.id,findingId:item.id,findingCategory:item.category,structuredValue:item.value,citationMatched:item.citation_status==='matched'});});registerCompanyFromExtraction(findings,nodeId);nodes[nodeId].status='evidenced';nodes[nodeId].updatedAt=new Date().toISOString();selected=nodeId;updateDetail(nodeId);render();saveState(`已写入 ${findings.length} 条年报发现并更新公司档案`);syncCurrentProject({silent:true}).catch(()=>{});closeExtraction();showToast(`已将 ${findings.length} 条年报发现写入节点资料并生成公司映射候选`);
}

function mappingCandidates(findings,originNodeId){
  const scores=new Map(),reasons=new Map();const add=(nodeId,score,reason)=>{scores.set(nodeId,Math.min(99,(scores.get(nodeId)||0)+score));const list=reasons.get(nodeId)||[];if(!list.includes(reason))list.push(reason);reasons.set(nodeId,list)};if(nodes[originNodeId])add(originNodeId,68,'年报在该产业节点上下文中上传并完成提取');
  (findings||[]).forEach(finding=>{const text=`${finding.title||''} ${finding.value||''} ${finding.quote||''}`.replace(/\s+/g,'');Object.entries(nodes).forEach(([nodeId,node])=>{if(node.type==='draft')return;const title=(node.title||'').replace(/\s+/g,'');if(title.length>=2&&text.includes(title))add(nodeId,32,`年报发现“${finding.title}”直接提及${node.title}`);else{const tokens=title.split(/[、与及\/·]/).filter(token=>token.length>=2);if(tokens.some(token=>text.includes(token)))add(nodeId,15,`业务描述与${node.title}关键词相符`);}})});
  return [...scores.entries()].filter(([,score])=>score>=30).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([nodeId,score])=>({id:`map_${Date.now()}_${nodeId}`,nodeId,score,status:'suggested',reason:(reasons.get(nodeId)||[]).join('；'),createdAt:new Date().toISOString()}));
}
function registerCompanyFromExtraction(findings,originNodeId){
  const result=currentExtraction?.result,name=(result?.company||'').trim();if(!name||name==='未识别公司')return;let company=companyData.find(item=>item.name.trim().toLowerCase()===name.toLowerCase());if(!company){company={id:`company_${Date.now()}`,name,reportPeriod:result.report_period||'',summary:result.summary||'',documents:[],findings:[],mappings:[],periods:[],createdAt:new Date().toISOString()};companyData.push(company);}company.reportPeriod=result.report_period||company.reportPeriod;company.summary=result.summary||company.summary;company.updatedAt=new Date().toISOString();company.periods=company.periods||[];const periodName=result.report_period||'报告期未识别';let period=company.periods.find(item=>item.period===periodName);if(!period){period={id:`period_${Date.now()}`,period:periodName,summary:result.summary||'',documents:[],findingIds:[],createdAt:new Date().toISOString()};company.periods.push(period);}period.summary=result.summary||period.summary;if(lastProcessedDocument&&!period.documents.some(item=>item.documentId===lastProcessedDocument.id))period.documents.push({documentId:lastProcessedDocument.id,filename:lastProcessedDocument.filename,extractionId:currentExtraction.id});if(lastProcessedDocument&&!company.documents.some(item=>item.documentId===lastProcessedDocument.id))company.documents.push({documentId:lastProcessedDocument.id,filename:lastProcessedDocument.filename,extractionId:currentExtraction.id});const existingFindingIds=new Set(company.findings.map(item=>`${item.extractionId}:${item.id}`));findings.forEach(item=>{if(!existingFindingIds.has(`${currentExtraction.id}:${item.id}`))company.findings.push({...item,reportPeriod:periodName,extractionId:currentExtraction.id,documentId:lastProcessedDocument?.id});});period.findingIds=[...new Set([...period.findingIds,...findings.map(item=>item.id)])];const candidates=mappingCandidates(findings,originNodeId),existingByNode=new Map(company.mappings.map(item=>[item.nodeId,item]));candidates.forEach(candidate=>{const existing=existingByNode.get(candidate.nodeId);if(existing){existing.score=Math.max(existing.score,candidate.score);existing.reason=candidate.reason;existing.updatedAt=new Date().toISOString();}else company.mappings.push(candidate);});activeCompanyId=company.id;
}
function renderNodeCompanies(nodeId){const linked=companyData.flatMap(company=>(company.mappings||[]).filter(mapping=>mapping.nodeId===nodeId&&mapping.status!=='rejected').map(mapping=>({company,mapping}))).sort((a,b)=>(a.mapping.status==='confirmed'?-1:1)-(b.mapping.status==='confirmed'?-1:1)||b.mapping.score-a.mapping.score);document.querySelector('#nodeCompanyCount').textContent=String(linked.length);document.querySelector('#nodeCompanyList').innerHTML=linked.length?linked.slice(0,5).map(({company,mapping})=>`<button class="node-company-chip" data-node-company="${escapeHtml(company.id)}"><span><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.reportPeriod||'报告期未识别')} · ${mapping.status==='confirmed'?'已确认映射':'待审核映射'}</small></span><b>${mapping.score}%</b></button>`).join(''):'<div class="empty-state">还没有公司映射；接纳年报提取结果后会生成候选</div>';document.querySelectorAll('[data-node-company]').forEach(button=>button.addEventListener('click',()=>openCompanies(button.dataset.nodeCompany)));
}
function closeCompanies(){const modal=document.querySelector('#companiesModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
let editingCompanyId=null;
function companyPeriodsHtml(company){const periods=[...(company.periods||[])].sort((a,b)=>String(b.period).localeCompare(String(a.period),'zh-CN'));if(!periods.length)return '<div class="company-periods"><strong>报告期档案</strong><div class="empty-state">尚未关联年报报告期</div></div>';return `<div class="company-periods"><strong>报告期档案（${periods.length}）</strong><div class="period-strip">${periods.map(period=>`<div class="period-card"><b>${escapeHtml(period.period)}</b><span>${(period.findingIds||[]).length} 条发现 · ${(period.documents||[]).length} 份年报</span><small>${escapeHtml(period.summary||'暂无期间摘要')}</small></div>`).join('')}</div></div>`;}
function companyMetricsHtml(company){const periods=[...new Set((company.findings||[]).map(item=>item.reportPeriod||company.reportPeriod||'未标注期间'))].sort((a,b)=>String(b).localeCompare(String(a),'zh-CN')),metrics=new Map();(company.findings||[]).filter(item=>item.category==='financial'||item.category==='capacity').forEach(item=>{const key=item.title||item.category_label||'经营指标';if(!metrics.has(key))metrics.set(key,new Map());metrics.get(key).set(item.reportPeriod||company.reportPeriod||'未标注期间',item.value)});if(!metrics.size)return '<div class="company-metrics"><strong>经营指标时间序列</strong><div class="empty-state">尚未提取财务或产能指标</div></div>';return `<div class="company-metrics"><strong>经营指标时间序列</strong><table class="metric-table"><thead><tr><th>指标</th>${periods.map(period=>`<th>${escapeHtml(period)}</th>`).join('')}</tr></thead><tbody>${[...metrics].map(([name,values])=>`<tr><td>${escapeHtml(name)}</td>${periods.map(period=>`<td>${escapeHtml(values.get(period)||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function companyManualMappingHtml(company){const mapped=new Set((company.mappings||[]).filter(item=>item.status==='confirmed').map(item=>item.nodeId)),options=Object.entries(nodes).filter(([id,node])=>node.type!=='draft'&&!mapped.has(id)).map(([id,node])=>`<option value="${escapeHtml(id)}">${escapeHtml(node.title)} · ${escapeHtml(node.category)}</option>`).join('');return `<div class="manual-map-row"><select id="manualCompanyNode">${options||'<option value="">没有其他可映射节点</option>'}</select><button id="addManualCompanyMapping" ${options?'':'disabled'}>＋ 手动确认节点</button></div>`;}
function openCompanyEditor(companyId=null){editingCompanyId=companyId;const company=companyData.find(item=>item.id===companyId);document.querySelector('#companyEditorTitle').textContent=company?'编辑公司档案':'新增公司档案';document.querySelector('#companyName').value=company?.name||'';document.querySelector('#companyPeriod').value=company?.reportPeriod||'';document.querySelector('#companySummary').value=company?.summary||'';const modal=document.querySelector('#companyEditorModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>document.querySelector('#companyName').focus(),50);}
function closeCompanyEditor(){const modal=document.querySelector('#companyEditorModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
function saveCompanyProfile(event){event.preventDefault();const name=document.querySelector('#companyName').value.trim(),period=document.querySelector('#companyPeriod').value.trim(),summary=document.querySelector('#companySummary').value.trim();if(!name)return;let company=companyData.find(item=>item.id===editingCompanyId);createSnapshot(`${company?'编辑':'新增'}公司档案`);if(company){company.name=name;company.reportPeriod=period;company.summary=summary;company.updatedAt=new Date().toISOString();}else{company={id:`company_manual_${Date.now()}`,name,reportPeriod:period,summary,documents:[],findings:[],mappings:[],periods:period?[{id:`period_manual_${Date.now()}`,period,summary,documents:[],findingIds:[],createdAt:new Date().toISOString()}]:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),manual:true};companyData.push(company);}activeCompanyId=company.id;saveState('公司档案已保存');closeCompanyEditor();renderCompanyList();openCompanies(company.id);updateDetail(selected);}
function deleteActiveCompany(){const company=companyData.find(item=>item.id===activeCompanyId);if(!company||!confirm(`删除公司档案“${company.name}”？产业图谱和原始资料不会被删除。`))return;createSnapshot(`删除公司档案“${company.name}”`);companyData=companyData.filter(item=>item.id!==company.id);companyCompareSelection.delete(company.id);activeCompanyId=companyData[0]?.id||null;saveState('公司档案已删除');renderCompanyList();updateDetail(selected);}
function addManualCompanyMapping(){const company=companyData.find(item=>item.id===activeCompanyId),nodeId=document.querySelector('#manualCompanyNode')?.value;if(!company||!nodeId)return;let mapping=(company.mappings||[]).find(item=>item.nodeId===nodeId);createSnapshot('手动确认公司产业映射');if(mapping){mapping.status='confirmed';mapping.score=Math.max(mapping.score||0,100);mapping.reason='研究员手动确认该公司属于此产业节点';mapping.reviewedAt=new Date().toISOString();}else company.mappings.push({id:`map_manual_${Date.now()}_${nodeId}`,nodeId,status:'confirmed',score:100,reason:'研究员手动确认该公司属于此产业节点',createdAt:new Date().toISOString(),reviewedAt:new Date().toISOString(),manual:true});saveState('公司产业节点已手动确认');renderCompanyList();updateDetail(selected);}
function renderCompanyList(){const q=document.querySelector('#companySearch').value.trim().toLowerCase(),filtered=companyData.filter(company=>[company.name,company.reportPeriod,company.summary,...(company.findings||[]).map(item=>item.value)].join(' ').toLowerCase().includes(q));if(!filtered.some(company=>company.id===activeCompanyId))activeCompanyId=filtered[0]?.id||null;document.querySelector('#companyList').innerHTML=filtered.length?filtered.map(company=>{const confirmed=(company.mappings||[]).filter(item=>item.status==='confirmed').length,suggested=(company.mappings||[]).filter(item=>item.status==='suggested').length;return `<div class="company-list-card-row"><button class="company-list-card ${company.id===activeCompanyId?'active':''}" data-company-id="${escapeHtml(company.id)}"><strong>${escapeHtml(company.name)}</strong><span>${escapeHtml(company.reportPeriod||'报告期未识别')} · ${confirmed} 个已确认节点 · ${suggested} 个待审核</span><small>${escapeHtml(company.summary||'暂无公司摘要')}</small></button><button class="company-compare-toggle ${companyCompareSelection.has(company.id)?'active':''}" data-company-compare="${escapeHtml(company.id)}" title="${companyCompareSelection.has(company.id)?'移出':'加入'}公司对比">⇄</button></div>`}).join(''):'<div class="empty-state">还没有公司档案；从年报提取结果写入节点后会自动创建</div>';document.querySelector('#companyStats').textContent=`共 ${companyData.length} 家公司 · ${companyData.reduce((sum,item)=>sum+(item.mappings||[]).filter(mapping=>mapping.status==='confirmed').length,0)} 条确认映射`;document.querySelectorAll('[data-company-id]').forEach(button=>button.addEventListener('click',()=>{activeCompanyId=button.dataset.companyId;renderCompanyList();renderCompanyDetail()}));document.querySelectorAll('[data-company-compare]').forEach(button=>button.addEventListener('click',()=>toggleCompanyCompare(button.dataset.companyCompare)));updateCompanyCompareControls();renderCompanyDetail();}
function renderCompanyDetail(){const company=companyData.find(item=>item.id===activeCompanyId),panel=document.querySelector('#companyDetail');if(!company){panel.innerHTML='<div class="empty-state">从左侧选择公司，查看年报发现与产业映射</div>';return;}const mappings=[...(company.mappings||[])].sort((a,b)=>({suggested:0,confirmed:1,rejected:2}[a.status]-({suggested:0,confirmed:1,rejected:2}[b.status])||b.score-a.score));panel.innerHTML=`<div class="company-profile-head"><div><h3>${escapeHtml(company.name)}</h3><p>${escapeHtml(company.summary||'暂无公司摘要')}</p></div><div class="company-head-actions"><span>${escapeHtml(company.reportPeriod||'报告期未识别')}</span><button id="toggleActiveCompanyCompare" class="${companyCompareSelection.has(company.id)?'compare-active':''}">${companyCompareSelection.has(company.id)?'移出对比':'加入对比'}</button><button id="editCompanyProfile">编辑</button><button class="danger" id="deleteCompanyProfile">删除</button></div></div>${companyPeriodsHtml(company)}${companyMetricsHtml(company)}<div class="company-mapping-toolbar"><strong>产业节点映射</strong><button id="regenerateCompanyMappings">重新计算候选</button></div>${companyManualMappingHtml(company)}<div>${mappings.length?mappings.map(mapping=>`<article class="company-mapping-card ${escapeHtml(mapping.status)}"><div class="company-mapping-main"><strong>${escapeHtml(nodes[mapping.nodeId]?.title||'已删除节点')}</strong><span>${escapeHtml(nodes[mapping.nodeId]?.category||'')}</span><small>${escapeHtml(mapping.reason||'待补充映射理由')}</small></div><div class="mapping-score"><b>${mapping.score}</b>匹配分</div><div class="mapping-actions"><button data-company-focus="${escapeHtml(mapping.nodeId)}">查看节点</button>${mapping.status!=='confirmed'?`<button class="confirm" data-mapping-status="confirmed" data-mapping-id="${escapeHtml(mapping.id)}">确认</button>`:''}${mapping.status!=='rejected'?`<button data-mapping-status="rejected" data-mapping-id="${escapeHtml(mapping.id)}">排除</button>`:`<button data-mapping-status="suggested" data-mapping-id="${escapeHtml(mapping.id)}">恢复</button>`}</div></article>`).join(''):'<div class="empty-state">还没有映射候选</div>'}</div><div class="company-findings"><strong>年报结构化发现（${company.findings.length}）</strong>${company.findings.map(item=>`<div class="company-finding"><b>${escapeHtml(item.category_label||item.category)} · ${escapeHtml(item.title)}</b><span>${escapeHtml(item.value)}</span><small>${escapeHtml(item.quote||'')} ${item.matched_pages?.length?`｜第 ${item.matched_pages.join('、')} 页`:''}</small></div>`).join('')}</div>`;document.querySelectorAll('[data-mapping-status]').forEach(button=>button.addEventListener('click',()=>setCompanyMappingStatus(button.dataset.mappingId,button.dataset.mappingStatus)));document.querySelectorAll('[data-company-focus]').forEach(button=>button.addEventListener('click',()=>{focusGraphNode(button.dataset.companyFocus);closeCompanies()}));document.querySelector('#regenerateCompanyMappings').addEventListener('click',regenerateActiveCompanyMappings);
}
function setCompanyMappingStatus(mappingId,status){const company=companyData.find(item=>item.id===activeCompanyId),mapping=company?.mappings.find(item=>item.id===mappingId);if(!mapping)return;createSnapshot(`${status==='confirmed'?'确认':'调整'}公司产业映射`);mapping.status=status;mapping.reviewedAt=new Date().toISOString();saveState('公司产业映射已更新');renderCompanyList();updateDetail(selected);}
function regenerateActiveCompanyMappings(){const company=companyData.find(item=>item.id===activeCompanyId);if(!company)return;const origin=company.mappings.find(item=>item.status==='confirmed')?.nodeId||company.mappings[0]?.nodeId||selected,candidates=mappingCandidates(company.findings,origin),existing=new Map(company.mappings.map(item=>[item.nodeId,item]));candidates.forEach(candidate=>{if(existing.has(candidate.nodeId)){const current=existing.get(candidate.nodeId);current.score=Math.max(current.score,candidate.score);current.reason=candidate.reason;}else company.mappings.push(candidate);});saveState('已重新计算公司映射候选');renderCompanyList();}
function openCompanies(companyId=null){if(companyId)activeCompanyId=companyId;else if(!activeCompanyId)activeCompanyId=companyData[0]?.id||null;renderCompanyList();const modal=document.querySelector('#companiesModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');setNavActive('companies');}

function updateCompanyCompareControls(){companyCompareSelection=new Set([...companyCompareSelection].filter(id=>companyData.some(company=>company.id===id)));const count=companyCompareSelection.size,counter=document.querySelector('#companyCompareCount'),button=document.querySelector('#openCompanyCompare'),pending=pendingCompanyMappings().length,reviewCounter=document.querySelector('#mappingReviewCount'),reviewButton=document.querySelector('#openMappingReview');if(counter)counter.textContent=String(count);if(button)button.disabled=count<2;if(reviewCounter)reviewCounter.textContent=String(pending);if(reviewButton)reviewButton.disabled=pending===0;}
function toggleCompanyCompare(companyId){if(companyCompareSelection.has(companyId))companyCompareSelection.delete(companyId);else{if(companyCompareSelection.size>=4){showToast('最多同时比较 4 家公司');return;}companyCompareSelection.add(companyId);}renderCompanyList();}
function companyMetricLines(company){return [...(company.findings||[])].filter(item=>item.category==='financial'||item.category==='capacity').sort((a,b)=>String(b.reportPeriod||'').localeCompare(String(a.reportPeriod||''),'zh-CN')).slice(0,8);}
function companyEvidenceStats(company){const findings=company.findings||[],matched=findings.filter(item=>item.citation_status==='matched'||(item.matched_pages||[]).length).length,total=findings.length;return {matched,total,score:total?Math.round(matched/total*100):0};}
function companyComparisonRows(companies){return [
  ['对比维度',...companies.map(company=>escapeHtml(company.name))],
  ['业务定位',...companies.map(company=>escapeHtml(company.summary||'暂无公司摘要'))],
  ['最新报告期',...companies.map(company=>escapeHtml(company.reportPeriod||'未识别'))],
  ['报告期档案',...companies.map(company=>`${(company.periods||[]).length} 期<small>${escapeHtml((company.periods||[]).map(item=>item.period).sort().reverse().join('、')||'尚无报告期')}</small>`)],
  ['产业覆盖',...companies.map(company=>{const mappings=(company.mappings||[]).filter(item=>item.status==='confirmed'&&nodes[item.nodeId]);return mappings.length?`<div class="mapping-tags">${mappings.map(item=>`<span>${escapeHtml(nodes[item.nodeId].title)}</span>`).join('')}</div>`:'尚无确认映射';})],
  ['经营指标',...companies.map(company=>{const metrics=companyMetricLines(company);return metrics.length?metrics.map(item=>`<span class="metric-line"><b>${escapeHtml(item.title||item.category_label||'指标')}</b> · ${escapeHtml(item.value||'—')}<small>${escapeHtml(item.reportPeriod||company.reportPeriod||'')}</small></span>`).join(''):'尚无财务或产能指标';})],
  ['资料规模',...companies.map(company=>`${(company.documents||[]).length} 份年报 · ${(company.findings||[]).length} 条结构化发现`)],
  ['证据完整度',...companies.map(company=>{const stats=companyEvidenceStats(company);return `<div class="evidence-score"><i><b style="width:${stats.score}%"></b></i><strong>${stats.score}%</strong></div><small>${stats.matched}/${stats.total} 条发现带页码原文</small>`;})]
];}
function renderCompanyComparison(){const companies=[...companyCompareSelection].map(id=>companyData.find(item=>item.id===id)).filter(Boolean),cols=`110px repeat(${companies.length},minmax(210px,1fr))`;document.querySelector('#companyComparisonTable').innerHTML=companyComparisonRows(companies).map((row,index)=>`<div class="comparison-row ${index===0?'header':''}" style="grid-template-columns:${cols}">${row.map(cell=>`<div class="comparison-cell">${cell}</div>`).join('')}</div>`).join('');}
function openCompanyComparison(){if(companyCompareSelection.size<2){showToast('请至少选择两家公司');return;}renderCompanyComparison();const companiesModal=document.querySelector('#companiesModal'),modal=document.querySelector('#companyCompareModal');companiesModal.classList.remove('open');companiesModal.setAttribute('aria-hidden','true');modal.classList.add('open');modal.setAttribute('aria-hidden','false');}
function closeCompanyComparison(){const modal=document.querySelector('#companyCompareModal'),companiesModal=document.querySelector('#companiesModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');companiesModal.classList.add('open');companiesModal.setAttribute('aria-hidden','false');}
function companyComparisonText(){const companies=[...companyCompareSelection].map(id=>companyData.find(item=>item.id===id)).filter(Boolean),plain=value=>String(value).replace(/<small>/g,'（').replace(/<\/small>/g,'）').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');return [`# ${companies.map(item=>item.name).join(' vs ')}`,...companyComparisonRows(companies).slice(1).map(row=>`\n## ${row[0]}\n${companies.map((company,index)=>`- **${company.name}**：${plain(row[index+1])}`).join('\n')}`)].join('\n');}
function exportCompanyMaster(){const companies=companyData.map(company=>({...JSON.parse(JSON.stringify(company)),mappings:(company.mappings||[]).map(mapping=>({...mapping,nodeTitle:nodes[mapping.nodeId]?.title||mapping.nodeTitle||'',nodeCategory:nodes[mapping.nodeId]?.category||mapping.nodeCategory||''}))}));exportJson({schema:'industry-atlas-company-master',version:1,exportedAt:new Date().toISOString(),companies},`${projectTitle}-公司主档.json`);showToast(`已导出 ${companies.length} 家公司主档`);}
function mergeUnique(target,incoming,keyFn){const keys=new Set(target.map(keyFn));incoming.forEach(item=>{const key=keyFn(item);if(!keys.has(key)){target.push(item);keys.add(key);}});}
function remapImportedMappings(mappings){return (mappings||[]).map(mapping=>{const sameProject=!mapping.projectId||mapping.projectId===mappedCloudProjectId();let nodeId=sameProject&&nodes[mapping.nodeId]?mapping.nodeId:null;if(!nodeId&&mapping.nodeTitle){nodeId=Object.keys(nodes).find(id=>nodes[id].title.trim().toLowerCase()===String(mapping.nodeTitle).trim().toLowerCase());}return nodeId?{...mapping,id:`map_import_${Date.now()}_${nodeId}_${Math.random().toString(36).slice(2,7)}`,nodeId,reason:`${mapping.reason||'公司主档映射'}；从公司主档导入`}:null;}).filter(Boolean);}
function mergeCompanyMaster(incoming){let added=0,merged=0;incoming.forEach((raw,index)=>{if(!raw||!String(raw.name||'').trim())return;const source=JSON.parse(JSON.stringify(raw)),existing=companyData.find(item=>item.name.trim().toLowerCase()===source.name.trim().toLowerCase()),mapped=remapImportedMappings(source.mappings);if(!existing){source.id=`company_import_${Date.now()}_${index}`;source.documents=source.documents||[];source.findings=source.findings||[];source.periods=source.periods||[];source.mappings=mapped;source.importedAt=new Date().toISOString();companyData.push(source);added++;return;}existing.documents=existing.documents||[];existing.findings=existing.findings||[];existing.periods=existing.periods||[];existing.mappings=existing.mappings||[];if(!existing.summary&&source.summary)existing.summary=source.summary;if(!existing.reportPeriod&&source.reportPeriod)existing.reportPeriod=source.reportPeriod;mergeUnique(existing.documents,source.documents||[],item=>`${item.documentId||''}:${item.filename||''}`);mergeUnique(existing.findings,source.findings||[],item=>`${item.reportPeriod||''}:${item.category||''}:${item.title||''}:${item.value||''}`);(source.periods||[]).forEach(period=>{const current=existing.periods.find(item=>item.period===period.period);if(!current){existing.periods.push(period);return;}current.documents=current.documents||[];current.findingIds=current.findingIds||[];mergeUnique(current.documents,period.documents||[],item=>`${item.documentId||''}:${item.filename||''}`);current.findingIds=[...new Set([...current.findingIds,...(period.findingIds||[])])];if(!current.summary&&period.summary)current.summary=period.summary;});mapped.forEach(mapping=>{if(!existing.mappings.some(item=>item.nodeId===mapping.nodeId))existing.mappings.push(mapping);});existing.updatedAt=new Date().toISOString();merged++;});return {added,merged};}
async function importCompanyMaster(file){try{const payload=JSON.parse(await file.text()),companies=Array.isArray(payload)?payload:payload.companies;if(!Array.isArray(companies))throw new Error('文件中没有公司主档列表');createSnapshot('导入公司主档');const result=mergeCompanyMaster(companies);activeCompanyId=companyData[0]?.id||null;saveState('公司主档已导入');renderCompanyList();updateDetail(selected);showToast(`公司主档导入完成：新增 ${result.added} 家，合并 ${result.merged} 家`);}catch(error){showToast(`导入失败：${error.message}`);}}
function workspaceCompanyPayload(projectId){return companyData.map(company=>({...JSON.parse(JSON.stringify(company)),sourceProjects:[...new Set([...(company.sourceProjects||[]),projectId])],mappings:(company.mappings||[]).map(mapping=>({...mapping,projectId,nodeTitle:nodes[mapping.nodeId]?.title||mapping.nodeTitle||'',nodeCategory:nodes[mapping.nodeId]?.category||mapping.nodeCategory||''}))}));}
async function pushWorkspaceCompanyMaster(projectId){const session=cloudWorkspace();if(!session||!cloudToken())return null;return cloudRequest('/api/companies/sync',{method:'POST',body:{workspace_id:session.id,project_id:projectId,companies:workspaceCompanyPayload(projectId)}});}
async function syncWorkspaceCompanyMaster(){if(!cloudToken()||!cloudWorkspace()){closeCompanies();openCloud();showToast('请先连接后端研究空间');return;}const button=document.querySelector('#syncCompanyMaster'),original=button.textContent;button.disabled=true;button.textContent='同步中…';try{let projectId=mappedCloudProjectId();if(!projectId)projectId=(await syncCurrentProject({silent:true,skipCompanyMaster:true})).id;const response=await pushWorkspaceCompanyMaster(projectId);createSnapshot('同步工作空间公司主档');const result=mergeCompanyMaster((response?.companies||[]).map(item=>item.data));saveState('工作空间公司主档已同步');renderCompanyList();updateDetail(selected);syncCurrentProject({silent:true,skipCompanyMaster:true}).catch(()=>{});showToast(`云端主档同步完成：拉取 ${response?.companies?.length||0} 家，新增 ${result.added} 家`);}catch(error){showToast(`云端主档同步失败：${error.message}`);}finally{button.disabled=false;button.textContent=original;}}
function pendingCompanyMappings(){return companyData.flatMap(company=>(company.mappings||[]).filter(mapping=>mapping.status==='suggested'&&nodes[mapping.nodeId]).map(mapping=>({key:`${company.id}:${mapping.id}`,company,mapping,node:nodes[mapping.nodeId]}))).sort((a,b)=>b.mapping.score-a.mapping.score||a.company.name.localeCompare(b.company.name,'zh-CN'));}
function renderMappingReview(){const q=(document.querySelector('#mappingReviewSearch').value||'').trim().toLowerCase(),all=pendingCompanyMappings(),visible=all.filter(item=>[item.company.name,item.node.title,item.node.category,item.mapping.reason].join(' ').toLowerCase().includes(q)),valid=new Set(all.map(item=>item.key));mappingReviewSelection=new Set([...mappingReviewSelection].filter(key=>valid.has(key)));document.querySelector('#mappingReviewList').innerHTML=visible.length?visible.map(item=>`<label class="mapping-review-item"><input type="checkbox" data-review-mapping="${escapeHtml(item.key)}" ${mappingReviewSelection.has(item.key)?'checked':''}/><span class="mapping-review-company"><strong>${escapeHtml(item.company.name)}</strong><small>${escapeHtml(item.company.reportPeriod||'报告期未识别')}</small></span><span class="mapping-review-node"><strong>${escapeHtml(item.node.title)}</strong><small>${escapeHtml(item.node.category||'')}</small></span><span class="mapping-review-score"><b>${item.mapping.score}</b>匹配分</span><span class="mapping-review-reason">${escapeHtml(item.mapping.reason||'待补充映射理由')}<small>${escapeHtml(item.company.findings?.[0]?.quote||item.company.summary||'暂无原文摘要')}</small></span></label>`).join(''):'<div class="empty-state">当前没有符合条件的待审核映射</div>';document.querySelectorAll('[data-review-mapping]').forEach(input=>input.addEventListener('change',()=>{if(input.checked)mappingReviewSelection.add(input.dataset.reviewMapping);else mappingReviewSelection.delete(input.dataset.reviewMapping);updateMappingReviewStats();}));const selectAll=document.querySelector('#selectAllMappings');selectAll.checked=visible.length>0&&visible.every(item=>mappingReviewSelection.has(item.key));updateMappingReviewStats(all.length);}
function updateMappingReviewStats(total=pendingCompanyMappings().length){const selectedCount=mappingReviewSelection.size;document.querySelector('#mappingReviewStats').textContent=`待审核 ${total} 条 · 已选择 ${selectedCount} 条`;document.querySelector('#confirmSelectedMappings').disabled=selectedCount===0;document.querySelector('#rejectSelectedMappings').disabled=selectedCount===0;}
function openMappingReview(){if(!pendingCompanyMappings().length){showToast('当前没有待审核的公司映射');return;}mappingReviewSelection.clear();document.querySelector('#mappingReviewSearch').value='';renderMappingReview();const companiesModal=document.querySelector('#companiesModal'),modal=document.querySelector('#mappingReviewModal');companiesModal.classList.remove('open');companiesModal.setAttribute('aria-hidden','true');modal.classList.add('open');modal.setAttribute('aria-hidden','false');}
function closeMappingReview(){const modal=document.querySelector('#mappingReviewModal'),companiesModal=document.querySelector('#companiesModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');companiesModal.classList.add('open');companiesModal.setAttribute('aria-hidden','false');renderCompanyList();}
function selectAllVisibleMappings(){const inputs=[...document.querySelectorAll('[data-review-mapping]')],checked=document.querySelector('#selectAllMappings').checked;inputs.forEach(input=>{input.checked=checked;if(checked)mappingReviewSelection.add(input.dataset.reviewMapping);else mappingReviewSelection.delete(input.dataset.reviewMapping);});updateMappingReviewStats();}
function applyBatchMappingStatus(status){if(!mappingReviewSelection.size)return;createSnapshot(`${status==='confirmed'?'批量确认':'批量排除'}公司产业映射`);let changed=0;mappingReviewSelection.forEach(key=>{const separator=key.indexOf(':'),companyId=key.slice(0,separator),mappingId=key.slice(separator+1),mapping=companyData.find(item=>item.id===companyId)?.mappings.find(item=>item.id===mappingId);if(mapping&&mapping.status==='suggested'){mapping.status=status;mapping.reviewedAt=new Date().toISOString();changed++;}});mappingReviewSelection.clear();saveState(`已${status==='confirmed'?'确认':'排除'} ${changed} 条公司产业映射`);renderMappingReview();renderCompanyList();updateDetail(selected);showToast(`已${status==='confirmed'?'确认':'排除'} ${changed} 条映射`);}

function visibleSet(){
  const visible = new Set([rootId]);
  function walk(id){
    if(!expanded.has(id)) return;
    (nodes[id].children||[]).forEach(child=>{ visible.add(child); walk(child); });
  }
  walk(rootId);
  if(nodes.cpo&&(reviewVisible || acceptedPatchIds.has('add-cpo'))){ visible.add('cpo'); }
  if(nodes.silicon&&(reviewVisible || acceptedPatchIds.has('add-silicon'))){ visible.add('silicon'); }
  return visible;
}

function currentWorkspaceState(){
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    nodes,
    edges,
    nodePositions,
    expanded: [...expanded],
    selected,
    zoom,
    draftAccepted,
    acceptedPatchIds:[...acceptedPatchIds],
    researchData,
    evidenceData,
    researchTasks,
    companyData,
    history,
    projectId:currentProjectId,
    projectTitle,
    rootId,
    aiPatches
  };
}

function saveState(message){
  const state = currentWorkspaceState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  let projects={};
  try{projects=JSON.parse(localStorage.getItem(PROJECTS_KEY)||'{}')}catch(_){projects={}}
  projects[currentProjectId]={title:projectTitle,state};
  localStorage.setItem(PROJECTS_KEY,JSON.stringify(projects));
  const syncText = document.querySelector('.sync-row span:last-child');
  if(syncText) syncText.textContent = '所有修改已保存';
  if(message) showToast(message);
  scheduleCloudSync();
}

function createSnapshot(reason){
  history.push({
    reason,
    at: new Date().toISOString(),
    state: JSON.parse(JSON.stringify({nodes, edges, nodePositions, expanded:[...expanded], selected, draftAccepted, acceptedPatchIds:[...acceptedPatchIds], researchData, evidenceData, researchTasks, rootId}))
  });
  if(history.length>30) history=history.slice(-30);
  updateUndoButton();
}

function updateUndoButton(){
  const button=document.querySelector('#undoAction');
  if(!button)return;
  button.disabled=history.length===0;
  button.style.opacity=history.length===0?'.42':'1';
  button.title=history.length?`撤销：${history[history.length-1].reason}`:'暂无可撤销的内容修改';
}

function undoLastChange(){
  const entry=history.pop();
  if(!entry){showToast('暂无可撤销的内容修改');return;}
  const state=entry.state;
  Object.keys(nodes).forEach(key=>delete nodes[key]);
  Object.assign(nodes,state.nodes);
  edges.splice(0,edges.length,...state.edges);
  nodePositions=state.nodePositions;
  expanded=new Set(state.expanded);
  selected=state.selected;
  draftAccepted=state.draftAccepted;
  acceptedPatchIds=new Set(state.acceptedPatchIds||[]);
  researchData=state.researchData||{};
  evidenceData=state.evidenceData||{};
  researchTasks=state.researchTasks||[];
  rootId=state.rootId||rootId;
  ensureNodeMetadata();
  document.querySelector('.ai-mode span').textContent=String(pendingPatchCount());
  updateDetail(selected);render();saveState(`已撤销：${entry.reason}`);updateUndoButton();
}

function render(){
  const visible = visibleSet();
  const maxY=Math.max(650,...[...visible].map(id=>(nodePositions[id]?.y||0)+100));world.style.height=`${maxY}px`;
  nodeLayer.innerHTML = '';
  visible.forEach(id=>{
    const n=nodes[id], pos=nodePositions[id];
    const el=document.createElement('article');
    el.className=`graph-node ${n.type==='core'?'core-node':n.type==='draft'?'ai-draft':'segment-node'} status-${escapeHtml(n.status||'unresearched')} ${selected===id?'selected':''} ${expanded.has(id)?'expanded':''}`;
    el.dataset.id=id; el.style.left=pos.x+'px'; el.style.top=pos.y+'px';
    const childCount=(n.children||[]).length;
    el.innerHTML=`<div class="node-tools"><button data-tool="add" title="添加子节点">＋</button><button data-tool="edit" title="修改节点">✎</button></div><div class="node-top"><span class="node-icon">${escapeHtml(n.icon)}</span><span class="node-title">${escapeHtml(n.title)}</span>${childCount?`<span class="node-count">${childCount}</span>`:''}</div><div class="node-desc">${escapeHtml(n.desc)}</div>${childCount?'<i class="expand-dot"></i>':''}`;
    el.addEventListener('click',event=>selectNode(id,event));
    el.addEventListener('dblclick',()=>{if(currentMode==='edit') renameNode(id)});
    if(currentMode==='edit') enableDrag(el,id);
    nodeLayer.appendChild(el);
  });
  drawEdges(visible);
  applySearch();
}

function drawEdges(visible){
  edgeLayer.innerHTML='';
  edges.filter(e=>visible.has(e.source)&&visible.has(e.target)&&(!e.draft||reviewVisible||acceptedPatchIds.has(e.draftPatch))).forEach(e=>{
    const a=nodePositions[e.source],b=nodePositions[e.target];
    const x1=a.x+166,y1=a.y+29,x2=b.x,y2=b.y+29,mid=x1+(x2-x1)*.48;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
    path.setAttribute('class',`graph-edge ${e.type} ${(selected===e.source||selected===e.target)?'active':''}`);
    path.dataset.source=e.source;path.dataset.target=e.target;path.dataset.type=e.type;
    edgeLayer.appendChild(path);
  });
  applyFilter(document.querySelector('.filter.active')?.dataset.filter||'all');
}

function selectNode(id,event){
  if(event?.target.closest('[data-tool]')){
    const tool=event.target.closest('[data-tool]').dataset.tool;
    if(tool==='edit') renameNode(id); else addChild(id); return;
  }
  selected=id;
  if(currentMode==='browse' && nodes[id].children?.length){
    expanded.has(id)?expanded.delete(id):expanded.add(id);
  }
  updateDetail(id); render(); saveState();
}

const defaultDetails = {
  optical:{dims:[['继续拆解','光芯片 · DSP · 激光器'],['关键指标','800G / 1.6T 渗透率'],['主要瓶颈','良率 · 功耗 · 光芯片'],['技术路线','可插拔 · 硅光 · CPO']],rels:[['交换芯片','配套连接','光模块'],['AI 集群','需求拉动','光模块'],['硅光芯片','上游供应','光模块']]},
  memory:{dims:[['继续拆解','HBM · DRAM · NAND'],['关键指标','带宽 · 容量 · 堆叠层数'],['主要瓶颈','良率 · TSV · 封装'],['技术路线','HBM3E · HBM4']],rels:[['晶圆制造','提供产能','存储芯片'],['存储芯片','供给数据','计算芯片'],['先进封装','集成','HBM']]},
  network:{dims:[['继续拆解','交换 · 光连接 · 铜连接'],['关键指标','带宽 · 延迟 · 拓扑'],['主要瓶颈','通信开销 · 功耗'],['技术路线','Scale-up · Scale-out']],rels:[['计算芯片','产生流量','网络互联'],['网络互联','支撑协同','AI 集群'],['交换芯片','控制转发','光模块']]}
};
researchData = {...defaultDetails,...researchData};

function updateDetail(id){
  const n=nodes[id];
  document.querySelector('#detailCategory').textContent=n.category;
  document.querySelector('#detailTitle').textContent=n.title;
  document.querySelector('#detailSummary').textContent=n.summary;
  document.querySelector('#detailWhy').textContent=n.why;
  const status=document.querySelector('#nodeStatus');status.value=n.status||'unresearched';status.className=`status-${n.status||'unresearched'}`;document.querySelector('#nodeUpdatedAt').textContent=n.updatedAt?`更新于 ${new Date(n.updatedAt).toLocaleDateString('zh-CN')}`:'尚未人工更新';
  const data=researchData[id]||{dims:[['继续拆解',(n.children||[]).map(c=>nodes[c].title).join(' · ')||'待进一步研究'],['关键指标','产能 · 成本 · 渗透率'],['主要瓶颈','点击让 AI 继续分析'],['相关趋势','查看最近研究资料']],rels:[['上游输入','供应或制约',n.title],[n.title,'价值传导','下游环节']]};
  document.querySelector('#dimensionGrid').innerHTML=data.dims.map(d=>`<button class="dimension"><span>${escapeHtml(d[0])}</span><strong>${escapeHtml(d[1])}</strong></button>`).join('');
  document.querySelectorAll('#dimensionGrid .dimension').forEach((button,index)=>button.addEventListener('click',()=>{
    const dimension=data.dims[index];document.querySelector('#askInput').value=`请深入解释“${n.title}”的${dimension[0]}：${dimension[1]}。请说明核心逻辑、关键指标和待核实问题。`;document.querySelector('#askInput').focus();showToast('已生成研究问题，可直接发送给 AI');
  }));
  const baseRelations=(data.rels||[]).map(r=>({source:r[0],label:r[1],target:r[2]}));
  const graphRelations=edges.filter(e=>e.type!=='structure'&&!e.draft&&(e.source===id||e.target===id)).map(e=>({source:nodes[e.source]?.title||e.source,label:e.label||({supply:'供应',depend:'依赖',constraint:'制约',substitute:'替代',benefit:'受益'}[e.type]||e.type),target:nodes[e.target]?.title||e.target,reason:e.reason,edgeId:e.id,userCreated:e.userCreated}));
  const allRelations=[...baseRelations,...graphRelations];
  document.querySelector('#relationList').innerHTML=allRelations.length?allRelations.map(r=>`<div class="relation-item ${r.userCreated?'manual':''}"><strong>${escapeHtml(r.source)}</strong><span>— ${escapeHtml(r.label)} →</span><strong>${escapeHtml(r.target)}</strong>${r.userCreated?`<button class="relation-delete" data-edge-id="${escapeHtml(r.edgeId)}" title="删除关系">×</button>`:''}${r.reason?`<small class="relation-reason">${escapeHtml(r.reason)}</small>`:''}</div>`).join(''):'<div class="empty-state">还没有记录关键关系</div>';
  document.querySelectorAll('.relation-delete').forEach(button=>button.addEventListener('click',()=>deleteRelation(button.dataset.edgeId)));
  renderSources(id);
  renderClaimCitations(id);
  renderNodeCompanies(id);
}

let editingSourceId=null;
function renderSources(id){
  const sources=evidenceData[id]||[];document.querySelector('#sourceCount').textContent=String(sources.length);
  document.querySelector('#sourceList').innerHTML=sources.length?sources.map(source=>`<div class="source-card"><span class="source-icon ${escapeHtml(source.type.toLowerCase())}">${escapeHtml(source.type)}</span><span><strong>${escapeHtml(source.title)}</strong><small>${escapeHtml(source.location||source.date||'未标注位置')} · ${source.verified?'已核验':'待核验'}</small></span><span class="source-actions">${source.url?`<button data-source-open="${escapeHtml(source.id)}" title="打开来源">↗</button>`:''}<button data-source-edit="${escapeHtml(source.id)}" title="编辑">✎</button><button data-source-delete="${escapeHtml(source.id)}" title="删除">×</button></span></div>`).join(''):'<div class="empty-state">还没有证据资料，建议为关键判断添加来源</div>';
  document.querySelectorAll('[data-source-open]').forEach(button=>button.addEventListener('click',()=>openSourceLink(button.dataset.sourceOpen)));
  document.querySelectorAll('[data-source-edit]').forEach(button=>button.addEventListener('click',()=>openSourceEditor(button.dataset.sourceEdit)));
  document.querySelectorAll('[data-source-delete]').forEach(button=>button.addEventListener('click',()=>deleteSource(button.dataset.sourceDelete)));
}

let editingClaim=null,citationReturnAfterSource=false;
function renderClaimCitations(id){
  const node=nodes[id],sources=evidenceData[id]||[];
  document.querySelectorAll('.claim-citations').forEach(container=>{
    const claim=container.dataset.claim,linked=new Set(node.citations?.[claim]||[]),items=sources.filter(source=>linked.has(source.id));
    container.innerHTML=`<button data-citation-edit="${claim}">${items.length?'管理引用':'＋ 关联证据'}</button>${items.map(source=>`<button class="citation-chip" data-citation-source="${escapeHtml(source.id)}" title="${escapeHtml(source.quote||source.title)}">▤ ${escapeHtml(source.title)}</button>`).join('')}`;
  });
  document.querySelectorAll('[data-citation-edit]').forEach(button=>button.addEventListener('click',()=>openCitationEditor(button.dataset.citationEdit)));
  document.querySelectorAll('[data-citation-source]').forEach(button=>button.addEventListener('click',()=>openSourceEditor(button.dataset.citationSource)));
}
function openCitationEditor(claim){
  editingClaim=claim;const node=nodes[selected],sources=evidenceData[selected]||[],linked=new Set(node.citations?.[claim]||[]);
  document.querySelector('#citationTitle').textContent=claim==='summary'?'为“一句话解释”关联资料':'为“为什么重要”关联资料';document.querySelector('#citationClaimText').textContent=node[claim];
  document.querySelector('#citationList').innerHTML=sources.length?sources.map(source=>`<label class="citation-choice"><input type="checkbox" value="${escapeHtml(source.id)}" ${linked.has(source.id)?'checked':''}/><span class="source-icon ${escapeHtml(source.type.toLowerCase())}">${escapeHtml(source.type)}</span><span><strong>${escapeHtml(source.title)}</strong><small>${escapeHtml(source.location||source.date||'未标注位置')} · ${source.verified?'已核验':'待核验'}</small></span></label>`).join(''):'<div class="empty-state">当前节点还没有资料，请先添加来源</div>';
  const modal=document.querySelector('#citationModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeCitationEditor(){const modal=document.querySelector('#citationModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
function saveCitations(event){
  event.preventDefault();if(!editingClaim)return;createSnapshot(`更新“${nodes[selected].title}”结论引用`);nodes[selected].citations[editingClaim]=[...document.querySelectorAll('#citationList input:checked')].map(input=>input.value);nodes[selected].updatedAt=new Date().toISOString();closeCitationEditor();renderClaimCitations(selected);saveState('结论与证据的引用关系已保存');
}

function openSourceEditor(sourceId=null){
  editingSourceId=sourceId;const source=(evidenceData[selected]||[]).find(item=>item.id===sourceId)||{};
  document.querySelector('#sourceDialogTitle').textContent=sourceId?'编辑证据资料':'添加证据资料';document.querySelector('#sourceType').value=source.type||'PDF';document.querySelector('#sourceDate').value=source.date||'';document.querySelector('#sourceTitle').value=source.title||'';document.querySelector('#sourceUrl').value=source.url||'';document.querySelector('#sourceLocation').value=source.location||'';document.querySelector('#sourceQuote').value=source.quote||'';document.querySelector('#sourceVerified').checked=Boolean(source.verified);
  const modal=document.querySelector('#sourceModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeSourceEditor(){document.querySelector('#sourceModal').classList.remove('open');document.querySelector('#sourceModal').setAttribute('aria-hidden','true');}
function saveSource(event){
  event.preventDefault();createSnapshot(`${editingSourceId?'编辑':'添加'}“${nodes[selected].title}”证据资料`);const list=evidenceData[selected]||(evidenceData[selected]=[]);
  const source={id:editingSourceId||`source_${Date.now()}`,type:document.querySelector('#sourceType').value,title:document.querySelector('#sourceTitle').value.trim(),url:document.querySelector('#sourceUrl').value.trim(),date:document.querySelector('#sourceDate').value,location:document.querySelector('#sourceLocation').value.trim(),quote:document.querySelector('#sourceQuote').value.trim(),verified:document.querySelector('#sourceVerified').checked};
  const index=list.findIndex(item=>item.id===editingSourceId);if(index>=0)list[index]=source;else list.push(source);nodes[selected].status=source.verified?'verified':'evidenced';nodes[selected].updatedAt=new Date().toISOString();closeSourceEditor();renderSources(selected);renderClaimCitations(selected);updateDetail(selected);render();saveState('证据资料已保存');if(citationReturnAfterSource){citationReturnAfterSource=false;setTimeout(()=>openCitationEditor(editingClaim||'summary'),210)}
}
function deleteSource(sourceId){
  const list=evidenceData[selected]||[],source=list.find(item=>item.id===sourceId);if(!source||!confirm(`删除资料“${source.title}”？`))return;createSnapshot(`删除证据“${source.title}”`);evidenceData[selected]=list.filter(item=>item.id!==sourceId);Object.keys(nodes[selected].citations||{}).forEach(claim=>{nodes[selected].citations[claim]=(nodes[selected].citations[claim]||[]).filter(id=>id!==sourceId)});renderSources(selected);renderClaimCitations(selected);saveState('证据资料已删除');
}
function openSourceLink(sourceId){
  const source=(evidenceData[selected]||[]).find(item=>item.id===sourceId);if(!source?.url)return;
  if(/^https?:\/\//i.test(source.url)){window.open(source.url,'_blank','noopener,noreferrer');return;}
  copyText(source.url);showToast('来源地址不是网页链接，已复制到剪贴板');
}

function openRelationEditor(){
  const options=Object.entries(nodes).map(([id,n])=>`<option value="${escapeHtml(id)}">${escapeHtml(n.title)}</option>`).join('');document.querySelector('#relationSource').innerHTML=options;document.querySelector('#relationTarget').innerHTML=options;document.querySelector('#relationSource').value=selected;document.querySelector('#relationTarget').value=Object.keys(nodes).find(id=>id!==selected)||selected;document.querySelector('#relationType').value='supply';document.querySelector('#relationLabel').value='';document.querySelector('#relationReason').value='';document.querySelector('#relationModal').classList.add('open');document.querySelector('#relationModal').setAttribute('aria-hidden','false');
}
function closeRelationEditor(){document.querySelector('#relationModal').classList.remove('open');document.querySelector('#relationModal').setAttribute('aria-hidden','true');}
function saveRelation(event){
  event.preventDefault();const source=document.querySelector('#relationSource').value,target=document.querySelector('#relationTarget').value;if(source===target){showToast('关系起点和终点不能相同');return;}createSnapshot(`添加“${nodes[source].title}”产业关系`);edges.push({id:`edge_user_${Date.now()}`,source,target,type:document.querySelector('#relationType').value,label:document.querySelector('#relationLabel').value.trim(),reason:document.querySelector('#relationReason').value.trim(),userCreated:true});closeRelationEditor();updateDetail(selected);render();saveState('产业关系已保存');
}
function deleteRelation(edgeId){
  const index=edges.findIndex(edge=>edge.id===edgeId);if(index<0||!confirm('删除这条产业关系？'))return;createSnapshot('删除产业关系');edges.splice(index,1);updateDetail(selected);render();saveState('产业关系已删除');
}

let aiPatches = [
  {id:'add-cpo',type:'add',symbol:'＋',title:'新增节点：CPO 共封装光学',scope:'网络互联 / 光连接技术路线',before:'当前图谱没有该节点',after:'新增 CPO 节点，并标记为光互联潜在演进路线',reason:'高速率升级下，功耗与信号完整性使 CPO 成为需要跟踪的技术方向。'},
  {id:'add-silicon',type:'add',symbol:'＋',title:'新增节点：硅光芯片',scope:'光模块 / 上游核心器件',before:'光模块上游缺少硅光分支',after:'新增硅光芯片，并连接至光模块',reason:'硅光影响高速光模块的集成度、成本与功耗，属于重要上游技术。'},
  {id:'change-optical',type:'change',symbol:'～',title:'完善内容：光模块为什么重要',scope:'光模块 / 研究卡片',before:'算力规模扩大带动高速光连接需求。',after:'补充“集群通信开销会降低有效算力”，并区分带宽、距离与功耗三个驱动因素。',reason:'原说明只有需求结论，缺少从集群扩张到光模块需求的中间逻辑。'},
  {id:'link-cpo',type:'link',symbol:'↗',title:'新增关系：CPO → 光模块',scope:'替代与技术演进关系',before:'两个概念之间没有关系',after:'CPO —潜在替代/演进→ 可插拔光模块',reason:'这不是简单的上下游关系，应明确表达为技术路线演进与部分替代。'}
];
if(Array.isArray(savedState?.aiPatches)&&savedState.aiPatches.length)aiPatches=savedState.aiPatches;

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));}
function pendingPatchCount(){return aiPatches.filter(p=>!acceptedPatchIds.has(p.id)).length;}

function renderPatchList(){
  const list=document.querySelector('#patchList');
  list.innerHTML=aiPatches.map(p=>{
    const accepted=acceptedPatchIds.has(p.id);
    return `<article class="patch-item ${escapeHtml(p.type)}" data-patch-id="${escapeHtml(p.id)}"><div class="patch-main"><input type="checkbox" ${accepted?'checked disabled':'checked'} aria-label="选择修改"/><span class="patch-type">${accepted?'✓':escapeHtml(p.symbol)}</span><span class="patch-title"><strong>${escapeHtml(p.title)}</strong><small>${accepted?'已写入正式图谱':escapeHtml(p.scope)}</small></span><button class="patch-toggle">查看差异</button></div><div class="patch-diff"><div class="diff-box before"><span>修改前</span><p>${escapeHtml(p.before)}</p></div><div class="diff-arrow">→</div><div class="diff-box after"><span>修改后</span><p>${escapeHtml(p.after)}</p></div><div class="patch-reason">AI 理由：${escapeHtml(p.reason)}</div></div></article>`;
  }).join('');
  list.querySelectorAll('.patch-toggle').forEach(button=>button.addEventListener('click',e=>{e.stopPropagation();button.closest('.patch-item').classList.toggle('open');button.textContent=button.closest('.patch-item').classList.contains('open')?'收起差异':'查看差异'}));
  list.querySelectorAll('input').forEach(input=>input.addEventListener('change',updatePatchCount));
  updatePatchCount();
}

function updatePatchCount(){
  const inputs=[...document.querySelectorAll('#patchList input:not(:disabled)')];
  const checked=inputs.filter(i=>i.checked).length;
  const accepted=acceptedPatchIds.size;
  document.querySelector('#selectedPatchCount').textContent=accepted?`已写入 ${accepted} 项 · 待接受 ${checked} 项`:`已选择 ${checked}/${inputs.length}`;
  document.querySelector('#acceptBatch').disabled=checked===0;
}

function setMode(mode){
  currentMode=mode;
  document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  world.classList.toggle('edit-state',mode==='edit');
  document.querySelector('#modeHint').textContent=mode==='browse'?'点击节点展开下一级，选择后查看研究卡片':mode==='edit'?'拖动节点调整位置，双击标题快速修改':'AI 修改以草稿形式显示，确认后才写入正式图谱';
  if(mode==='review') openReview(); else if(reviewVisible) closeReview(false);
  render();
}

function openReview(){ reviewVisible=true;renderPatchList();document.querySelector('#reviewDrawer').classList.add('open');render(); }
function closeReview(returnBrowse=true){ reviewVisible=false;document.querySelector('#reviewDrawer').classList.remove('open');if(returnBrowse)setMode('browse');else render(); }

function acceptDrafts(){
  const chosen=[...document.querySelectorAll('#patchList .patch-item')].filter(item=>item.querySelector('input:checked:not(:disabled)')).map(item=>item.dataset.patchId);
  if(!chosen.length){showToast('请先选择要接受的修改');return;}
  createSnapshot(`接受 ${chosen.length} 项 AI 修改`);
  chosen.forEach(id=>{
    acceptedPatchIds.add(id);
    const dynamicPatch=aiPatches.find(p=>p.id===id);
    if(dynamicPatch?.applySpec){applyStructuredPatch(dynamicPatch.applySpec);return;}
    if(id==='add-cpo'){nodes.cpo.type='segment';nodes.cpo.desc='共封装光学演进路线';}
    if(id==='add-silicon'){nodes.silicon.type='segment';nodes.silicon.desc='光电集成核心器件';}
    if(id==='change-optical'){nodes.optical.why='大规模 AI 集群需要大量 GPU 协同工作。节点间通信开销会直接降低有效算力，因此带宽、传输距离与功耗共同推动高速光连接升级。';}
  });
  draftAccepted=acceptedPatchIds.size===aiPatches.length;
  reviewVisible=false;document.querySelector('#reviewDrawer').classList.remove('open');
  document.querySelector('.ai-mode span').textContent=String(pendingPatchCount());
  updateDetail(selected);saveState(`已接受 ${chosen.length} 项 AI 修改`);setMode('browse');
}

function applyStructuredPatch(spec){
  if(spec.operation==='add_node'){
    const parentId=nodes[spec.parentId]?spec.parentId:selected;
    const parent=nodes[parentId],id=spec.id&&!nodes[spec.id]?spec.id:`ai_node_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    nodes[id]={title:spec.title||'AI 新增节点',desc:spec.summary||'AI 新增 · 待继续研究',x:0,y:0,type:'segment',icon:'✦',children:[],category:spec.category||`${parent.title} · AI 新增`,summary:spec.summary||'等待进一步完善。',why:spec.why||'由 AI 根据当前产业结构建议补充。',status:'ai',updatedAt:new Date().toISOString(),citations:{summary:[],why:[]}};
    const siblings=parent.children||[];parent.children=siblings;const p=nodePositions[parentId];nodePositions[id]={x:p.x+230,y:p.y+72*(siblings.length+1)};parent.children.push(id);edges.push({source:parentId,target:id,type:'structure'});expanded.add(parentId);
  }
  if(spec.operation==='update_node'&&nodes[spec.targetId]){
    const allowed=['title','desc','category','summary','why'];const field=allowed.includes(spec.field)?spec.field:'summary';nodes[spec.targetId][field]=String(spec.value||'');
  }
  if(spec.operation==='add_relation'&&nodes[spec.sourceId]&&nodes[spec.targetId]){
    if(!edges.some(e=>e.source===spec.sourceId&&e.target===spec.targetId&&e.type===(spec.relationType||'depend')))edges.push({source:spec.sourceId,target:spec.targetId,type:spec.relationType||'depend'});
  }
}
function rejectDrafts(){ reviewVisible=false;showToast('已拒绝本批 AI 建议，正式图谱未发生变化');setMode('browse'); }

function renameNode(id){
  const next=prompt('修改节点名称',nodes[id].title);
  if(next&&next.trim()&&next.trim()!==nodes[id].title){createSnapshot(`修改“${nodes[id].title}”名称`);nodes[id].title=next.trim();nodes[id].desc='人工修改 · 刚刚保存';render();updateDetail(id);saveState('节点已修改并自动保存');}
}
function addChild(id){
  const name=prompt(`在“${nodes[id].title}”下添加子节点`,'新研究节点');
  if(!name?.trim())return;
  createSnapshot(`在“${nodes[id].title}”下新增节点`);
  const key='custom_'+Date.now(),p=nodePositions[id];
  nodes[key]={title:name.trim(),desc:'待补充研究说明',x:p.x+225,y:p.y+78,type:'segment',icon:'＋',children:[],category:`${nodes[id].title} · 人工新增`,summary:'这是一个由用户新增、等待继续完善的研究节点。',why:'可以通过右下角 AI 研究框继续补充其产业含义、上下游关系和证据。',status:'unresearched',updatedAt:new Date().toISOString(),citations:{summary:[],why:[]}};
  nodePositions[key]={x:p.x+225,y:p.y+78}; nodes[id].children.push(key);edges.push({source:id,target:key,type:'structure'});expanded.add(id);render();saveState('已新增节点并自动保存');
}

function enableDrag(el,id){
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0||e.target.closest('button'))return;
    const start={pointerX:e.clientX,pointerY:e.clientY,nodeX:nodePositions[id].x,nodeY:nodePositions[id].y};let moved=false;el.setPointerCapture(e.pointerId);el.classList.add('dragging');
    const move=ev=>{if(!moved&&Math.hypot(ev.clientX-start.pointerX,ev.clientY-start.pointerY)>2){createSnapshot(`移动“${nodes[id].title}”`);moved=true;}nodePositions[id].x=Math.max(0,start.nodeX+(ev.clientX-start.pointerX)/zoom);nodePositions[id].y=Math.max(0,start.nodeY+(ev.clientY-start.pointerY)/zoom);el.style.left=nodePositions[id].x+'px';el.style.top=nodePositions[id].y+'px';drawEdges(visibleSet())};
    const up=()=>{el.classList.remove('dragging');el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);if(moved)saveState('位置已保存')};
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);
  });
}

function applySearch(){
  const q=document.querySelector('#graphSearch').value.trim().toLowerCase();
  document.querySelectorAll('.graph-node').forEach(el=>el.classList.toggle('match',!!q&&nodes[el.dataset.id].title.toLowerCase().includes(q)));
}
function applyFilter(filter){
  document.querySelectorAll('.graph-edge').forEach(p=>p.classList.toggle('hidden',filter!=='all'&&p.dataset.type!==filter&&p.dataset.type!=='structure'));
}
function setZoom(z, persist=true){zoom=Math.min(1.3,Math.max(.65,z));world.style.transform=`scale(${zoom})`;document.querySelector('#zoomValue').textContent=Math.round(zoom*100)+'%';if(persist)saveState();}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2300)}

function exportWorkspace(){
  saveState();
  const payload = localStorage.getItem(STORAGE_KEY);
  const blob = new Blob([payload], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`industry-atlas-${new Date().toISOString().slice(0,10)}.json`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),500);
  showToast('研究工作区已导出为 JSON 备份');
}

function importWorkspace(file){
  const reader = new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(data.version!==1 || !data.nodes || !data.nodePositions) throw new Error('invalid');
      localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
      showToast('备份已导入，正在恢复工作区');
      setTimeout(()=>location.reload(),500);
    }catch(_){ showToast('无法导入：文件不是有效的工作区备份'); }
  };
  reader.readAsText(file);
}

function getNodeResearch(id){
  return researchData[id]||{
    dims:[
      ['继续拆解',(nodes[id].children||[]).map(c=>nodes[c].title).join(' · ')||'待进一步研究'],
      ['关键指标','产能 · 成本 · 渗透率'],
      ['主要瓶颈','点击让 AI 继续分析'],
      ['相关趋势','查看最近研究资料']
    ],
    rels:[['上游输入','供应或制约',nodes[id].title],[nodes[id].title,'价值传导','下游环节']]
  };
}

function openResearchEditor(){
  const n=nodes[selected],data=getNodeResearch(selected);
  document.querySelector('#fieldTitle').value=n.title;
  document.querySelector('#fieldCategory').value=n.category;
  document.querySelector('#fieldSummary').value=n.summary;
  document.querySelector('#fieldWhy').value=n.why;
  document.querySelector('#fieldBreakdown').value=data.dims?.[0]?.[1]||'';
  document.querySelector('#fieldMetrics').value=data.dims?.[1]?.[1]||'';
  document.querySelector('#fieldBottleneck').value=data.dims?.[2]?.[1]||'';
  document.querySelector('#fieldRoute').value=data.dims?.[3]?.[1]||'';
  const modal=document.querySelector('#editorModal');
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.querySelector('#fieldTitle').focus(),100);
}

function closeResearchEditor(){
  const modal=document.querySelector('#editorModal');
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
}

function saveResearchCard(event){
  event.preventDefault();
  const n=nodes[selected],oldTitle=n.title,oldData=getNodeResearch(selected);
  createSnapshot(`编辑“${oldTitle}”研究卡片`);
  n.title=document.querySelector('#fieldTitle').value.trim();
  n.category=document.querySelector('#fieldCategory').value.trim();
  n.summary=document.querySelector('#fieldSummary').value.trim();
  n.why=document.querySelector('#fieldWhy').value.trim();
  n.desc='研究卡片已更新 · 刚刚保存';
  n.status='edited';n.updatedAt=new Date().toISOString();
  researchData[selected]={
    dims:[
      ['继续拆解',document.querySelector('#fieldBreakdown').value.trim()||'待进一步研究'],
      ['关键指标',document.querySelector('#fieldMetrics').value.trim()||'待补充'],
      ['主要瓶颈',document.querySelector('#fieldBottleneck').value.trim()||'待补充'],
      ['技术路线',document.querySelector('#fieldRoute').value.trim()||'待补充']
    ],
    rels:oldData.rels||[]
  };
  closeResearchEditor();updateDetail(selected);render();saveState('研究卡片已保存，并生成版本快照');
}

function normalizeApiUrl(base,protocol){
  const clean=base.trim().replace(/\/+$/,'');
  if(protocol==='responses')return clean.endsWith('/responses')?clean:`${clean}/responses`;
  return clean.endsWith('/chat/completions')?clean:`${clean}/chat/completions`;
}

function parseModelJson(text){
  const cleaned=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(cleaned)}catch(_){
    const start=cleaned.indexOf('{'),end=cleaned.lastIndexOf('}');
    if(start>=0&&end>start)return JSON.parse(cleaned.slice(start,end+1));
    throw new Error('模型没有返回可解析的 JSON');
  }
}

async function callConfiguredModel(systemPrompt,userPrompt){
  if(apiConfig.mode!=='api')throw new Error('当前仍是演示模式，请先在接口设置中启用自定义 API');
  const key=sessionStorage.getItem(API_KEY_SESSION)||'';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),Number(apiConfig.timeout)||60000);
  const headers={'Content-Type':'application/json'};if(key)headers.Authorization=`Bearer ${key}`;
  const url=normalizeApiUrl(apiConfig.baseUrl,apiConfig.protocol);
  let body;
  if(apiConfig.protocol==='responses'){
    body={model:apiConfig.model,instructions:systemPrompt,input:userPrompt,reasoning:{effort:apiConfig.reasoningEffort}};
  }else{
    body={model:apiConfig.model,messages:[{role:'system',content:systemPrompt},{role:'user',content:userPrompt}],response_format:{type:'json_object'}};
    if(apiConfig.provider==='deepseek'){body.thinking={type:apiConfig.reasoningEffort==='low'?'disabled':'enabled'};if(body.thinking.type==='enabled')body.reasoning_effort=apiConfig.reasoningEffort==='high'?'max':'high';}
  }
  try{
    const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:controller.signal});
    const raw=await response.text();if(!response.ok)throw new Error(`接口返回 ${response.status}：${raw.slice(0,180)}`);
    const data=JSON.parse(raw);let output='';
    if(apiConfig.protocol==='responses')output=data.output_text||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text||'';
    else output=data.choices?.[0]?.message?.content||'';
    return parseModelJson(output);
  }catch(error){if(error.name==='AbortError')throw new Error('请求超时，请检查模型速度或调高超时时间');throw error}finally{clearTimeout(timer)}
}

function compactGraphContext(){
  return {projectTitle,nodes:Object.entries(nodes).map(([id,n])=>({id,title:n.title,summary:n.summary,why:n.why,children:n.children})),relations:edges.filter(e=>!e.draft).map(({source,target,type})=>({source,target,type}))};
}

async function requestIndustryFromApi(name){
  const system='你是一名严谨的产业研究分析师。只返回合法 JSON，不要 Markdown。先建立稳定的产业骨架，再逐层拆解。避免把公司当作产业主节点。所有内容使用中文。';
  const user=`为“${name}”创建产业研究图谱。返回严格结构：{"title":"产业链名称","overview":"一句话总览","branches":[{"title":"核心分支","summary":"它是什么","why":"为什么重要","children":[{"title":"细分环节","summary":"它是什么","why":"为什么重要"}]}]}。要求 3-6 个核心分支，每个分支 2-5 个细分环节，概念之间不能重复。`;
  const result=await callConfiguredModel(system,user);
  if(!Array.isArray(result.branches)||result.branches.length<2)throw new Error('模型结果缺少有效的 branches 数组');
  return result;
}

async function requestPatchesFromApi(instruction){
  const system='你是产业图谱编辑助手。只返回合法 JSON，不要 Markdown。你只能提出补丁，不能返回整张重写后的图。引用的节点 ID 必须来自输入；新增节点可给出新的英文 ID。';
  const user=`当前图谱：${JSON.stringify(compactGraphContext())}\n用户要求：${instruction}\n返回严格结构：{"patches":[{"operation":"add_node|update_node|add_relation","id":"新增节点ID","parentId":"父节点ID","targetId":"修改目标ID","sourceId":"关系起点ID","field":"summary|why|title|category","value":"修改后的字段值","title":"节点标题","summary":"节点说明","why":"重要性","relationType":"supply|depend|constraint","reason":"修改理由"}]}。只提出必要修改，最多 10 项。`;
  const result=await callConfiguredModel(system,user);
  if(!Array.isArray(result.patches)||!result.patches.length)throw new Error('模型没有返回有效的 patches 数组');
  return result.patches;
}

function layoutGeneratedTree(graphNodes,root){
  const positions={},branches=graphNodes[root]?.children||[];let cursor=30;
  branches.forEach(branchId=>{const children=graphNodes[branchId]?.children||[],block=Math.max(92,children.length*68);positions[branchId]={x:270,y:cursor+(block-58)/2};children.forEach((childId,index)=>{positions[childId]={x:510,y:cursor+index*68}});cursor+=block+24;});
  const branchYs=branches.map(id=>positions[id].y);positions[root]={x:40,y:branchYs.length?(Math.min(...branchYs)+Math.max(...branchYs))/2:260};return positions;
}

function projectFromModelResult(data,fallbackName){
  const title=String(data.title||`${fallbackName}产业链`);const root='industry';const newNodes={},newEdges=[],positions={},newResearch={};
  const branches=data.branches.slice(0,6);newNodes[root]={title:title.replace('产业链','产业'),desc:'AI API 生成 · 产业研究总览',x:40,y:292,type:'core',icon:'AI',children:[],category:'产业总览 · AI 新建',summary:String(data.overview||`围绕${title}形成的产业体系。`),why:'用于理解产业结构、价值传导、关键瓶颈与技术演进。'};positions[root]={x:40,y:292};
  branches.forEach((branch,index)=>{const id=`branch_${index+1}`,y=40+index*(600/Math.max(branches.length,4));newNodes[root].children.push(id);newNodes[id]={title:String(branch.title||`核心分支 ${index+1}`),desc:String(branch.summary||'AI 生成的产业分支'),x:270,y,type:'core',icon:String(index+1),children:[],category:`${title} · 核心分支`,summary:String(branch.summary||'待继续研究'),why:String(branch.why||'待继续研究')};positions[id]={x:270,y};newEdges.push({source:root,target:id,type:'structure'});(Array.isArray(branch.children)?branch.children:[]).slice(0,5).forEach((child,ci)=>{const cid=`${id}_child_${ci+1}`,cy=y-15+ci*61;newNodes[id].children.push(cid);newNodes[cid]={title:String(child.title||`细分环节 ${ci+1}`),desc:String(child.summary||'AI 生成的细分环节'),x:510,y:cy,type:'segment',icon:'◇',children:[],category:`${branch.title} · 细分环节`,summary:String(child.summary||'待继续研究'),why:String(child.why||'待继续研究')};positions[cid]={x:510,y:cy};newEdges.push({source:id,target:cid,type:'structure'});});});
  const arranged=layoutGeneratedTree(newNodes,root);
  return {title,rootId:root,nodes:newNodes,edges:newEdges,nodePositions:arranged,researchData:newResearch,evidenceData:{},expanded:[root,...newNodes[root].children],selected:newNodes[root].children[0]||root};
}

function normalizeModelPatches(patches){
  return patches.slice(0,10).map((spec,index)=>{
    const operation=['add_node','update_node','add_relation'].includes(spec.operation)?spec.operation:'update_node';
    let type=operation==='add_node'?'add':operation==='add_relation'?'link':'change',symbol=type==='add'?'＋':type==='link'?'↗':'～',title,before,after,scope;
    if(operation==='add_node'){title=`新增节点：${spec.title||'未命名节点'}`;before='当前图谱没有该节点';after=`新增到“${nodes[spec.parentId]?.title||nodes[selected]?.title||'当前分支'}”下：${spec.summary||''}`;scope='AI API / 新增产业节点';}
    else if(operation==='add_relation'){title=`新增关系：${nodes[spec.sourceId]?.title||spec.sourceId} → ${nodes[spec.targetId]?.title||spec.targetId}`;before='当前没有这条关系';after=`关系类型：${spec.relationType||'depend'}`;scope='AI API / 产业关系';}
    else{const target=nodes[spec.targetId],field=['summary','why','title','category'].includes(spec.field)?spec.field:'summary';title=`修改内容：${target?.title||spec.targetId}`;before=target?.[field]||'原字段为空';after=String(spec.value||'');scope=`AI API / ${field}`;spec.field=field;}
    return {id:`api-patch-${Date.now()}-${index}`,type,symbol,title,scope,before,after,reason:String(spec.reason||'模型未提供具体理由'),applySpec:spec};
  });
}

function refreshProviderStatus(){
  const providerNames={deepseek:'DeepSeek',openai:'OpenAI',custom:'兼容 API'},provider=providerNames[apiConfig.provider]||'自定义 API',label=apiConfig.mode==='api'?`${provider} · ${apiConfig.model}`:`演示模式 · 可切换至 ${provider}`;
  const status=document.querySelector('#providerStatus');if(status)status.textContent=label;
  const researchButton=document.querySelector('#aiOpen');if(researchButton)researchButton.textContent=apiConfig.mode==='api'&&apiConfig.provider==='deepseek'?'✦ DeepSeek 研究':'✦ AI 研究';
}

function readApiSettingsForm(){
  return {mode:document.querySelector('input[name="runtimeMode"]:checked').value,provider:document.querySelector('#apiProvider').value,protocol:document.querySelector('#apiProtocol').value,baseUrl:document.querySelector('#apiBaseUrl').value.trim(),model:document.querySelector('#apiModel').value.trim(),reasoningEffort:document.querySelector('#reasoningEffort').value,timeout:Number(document.querySelector('#apiTimeout').value)};
}

function applyProviderPreset(provider,force=false){
  const protocol=document.querySelector('#apiProtocol'),base=document.querySelector('#apiBaseUrl'),model=document.querySelector('#apiModel'),hint=document.querySelector('#apiEndpointHint');
  if(provider==='deepseek'){protocol.value='chat';protocol.disabled=true;if(force||!base.value)base.value='https://api.deepseek.com';if(force||!model.value)model.value='deepseek-v4-flash';hint.textContent='官方标准端点：https://api.deepseek.com/chat/completions；推荐模型 deepseek-v4-flash，深度任务可改为 deepseek-v4-pro。';}
  else if(provider==='openai'){protocol.disabled=false;if(force){protocol.value='responses';base.value='https://api.openai.com/v1';model.value='gpt-5.6-terra';}hint.textContent='填写到 /v1 即可，系统会根据协议补全 /responses 或 /chat/completions。';}
  else{protocol.disabled=false;if(force){protocol.value='chat';base.value='';model.value='';}hint.textContent='填写兼容服务的 Base URL、模型名和协议；系统会自动补全具体路径。';}
}

function updateApiFieldsState(){
  const mode=document.querySelector('input[name="runtimeMode"]:checked').value;
  document.querySelector('#apiFields').classList.toggle('disabled',mode==='demo');
}

function openAiSettings(){
  document.querySelector(`input[name="runtimeMode"][value="${apiConfig.mode}"]`).checked=true;
  document.querySelector('#apiProvider').value=apiConfig.provider||'deepseek';document.querySelector('#apiProtocol').value=apiConfig.protocol;document.querySelector('#apiBaseUrl').value=apiConfig.baseUrl;document.querySelector('#apiModel').value=apiConfig.model;document.querySelector('#reasoningEffort').value=apiConfig.reasoningEffort;document.querySelector('#apiTimeout').value=String(apiConfig.timeout);applyProviderPreset(apiConfig.provider||'deepseek');
  document.querySelector('#apiKey').value=sessionStorage.getItem(API_KEY_SESSION)||'';document.querySelector('#connectionResult').className='connection-result';document.querySelector('#connectionResult').textContent='尚未测试接口';updateApiFieldsState();
  const modal=document.querySelector('#aiSettingsModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeAiSettings(){const modal=document.querySelector('#aiSettingsModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}

function saveApiSettings(event){
  event.preventDefault();const next=readApiSettingsForm();
  if(next.mode==='api'&&(!next.baseUrl||!next.model)){showToast('请填写 Base URL 和模型名称');return;}
  apiConfig=next;localStorage.setItem(AI_CONFIG_KEY,JSON.stringify(apiConfig));const key=document.querySelector('#apiKey').value.trim();if(key)sessionStorage.setItem(API_KEY_SESSION,key);else sessionStorage.removeItem(API_KEY_SESSION);
  closeAiSettings();refreshProviderStatus();showToast(apiConfig.mode==='api'?`已启用 ${apiConfig.model}`:'已切换到演示模式');
}

async function testApiConnection(){
  const result=document.querySelector('#connectionResult'),button=document.querySelector('#testConnection');const previous=apiConfig;apiConfig=readApiSettingsForm();
  const key=document.querySelector('#apiKey').value.trim();if(key)sessionStorage.setItem(API_KEY_SESSION,key);
  if(apiConfig.mode==='demo'){result.className='connection-result success';result.textContent='演示模式可用，无需连接网络';apiConfig=previous;return;}
  button.disabled=true;result.className='connection-result';result.textContent='正在请求模型…';
  try{const data=await callConfiguredModel('只返回 JSON，不要解释。','返回 {"ok":true,"message":"connection ready"}');result.className='connection-result success';result.textContent=data.ok?'连接成功，模型返回格式正常':'接口已响应，但返回内容不符合预期';}
  catch(error){result.className='connection-result error';result.textContent=`连接失败：${error.message}`;}
  finally{button.disabled=false;apiConfig=previous;}
}

function openAiStudio(tab='modify'){
  refreshProviderStatus();
  document.querySelector('#aiCurrentProject').textContent=projectTitle;
  document.querySelectorAll('.ai-tab').forEach(button=>button.classList.toggle('active',button.dataset.aiTab===tab));
  document.querySelectorAll('.ai-pane').forEach(pane=>pane.classList.toggle('active',pane.dataset.aiPane===tab));
  const modal=document.querySelector('#aiStudioModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeAiStudio(){const modal=document.querySelector('#aiStudioModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}

function buildIndustryProject(name){
  const isSolar=name.includes('光伏');
  const title=isSolar?'光伏产业链':`${name.replace(/行业|产业链/g,'').trim()||'新行业'}产业链`;
  const root='industry';
  const branchData=isSolar?[
    ['materials','上游材料','硅料、辅材与关键耗材','原材料与辅材决定制造成本，并受到产能周期和技术变化影响。',[['polysilicon','多晶硅','光伏级硅料'],['wafer','硅片','拉晶、切片与薄片化']]],
    ['manufacturing','电池与组件','电池片、封装与组件制造','电池效率、制造成本和技术路线决定组件竞争力。',[['cell','电池片','TOPCon、HJT、BC'],['module','光伏组件','封装、功率与可靠性']]],
    ['system','系统设备','逆变、储能与系统集成','系统设备把直流发电能力转化为稳定、可并网的电力输出。',[['inverter','逆变器','直交流转换与控制'],['storage','储能系统','平滑出力与电力调节']]],
    ['application','电站与应用','集中式、分布式与运营','终端项目收益取决于发电量、电价、利用率与融资成本。',[['utility','集中式电站','大型地面光伏项目'],['distributed','分布式光伏','工商业与户用场景']]]
  ]:[
    ['resources','上游资源','原材料与关键投入','决定产业供给能力与基础成本。',[['raw','核心原料','关键资源与耗材'],['equipment','生产设备','制造与检测设备']]],
    ['manufacturing','核心制造','产品与关键工艺','把上游投入转化为可规模交付的核心产品。',[['product','核心产品','主要产品形态'],['process','关键工艺','效率、良率与成本']]],
    ['system','系统集成','配套设备与解决方案','负责产品组合、系统交付与可靠运行。',[['component','配套部件','辅助产品与服务'],['solution','解决方案','集成与交付']]],
    ['application','下游应用','客户与使用场景','实际需求决定产业规模和价值兑现。',[['market','主要市场','核心客户群体'],['service','运营服务','持续运营与售后']]]
  ];
  const newNodes={};const newEdges=[];const positions={};const newResearch={};
  newNodes[root]={title:title.replace('产业链','产业'),desc:'AI 生成 · 产业研究总览',x:40,y:292,type:'core',icon:'AI',children:branchData.map(b=>b[0]),category:'产业总览 · AI 新建',summary:`围绕${title.replace('产业链','产业')}形成的资源、制造、系统和应用体系。`,why:'通过逐层拆解产业结构，可以快速识别价值传导、核心瓶颈与技术演进方向。'};positions[root]={x:40,y:292};
  branchData.forEach((branch,index)=>{
    const [id,label,desc,why,children]=branch;const y=70+index*150;
    newNodes[id]={title:label,desc,x:270,y,type:'core',icon:String(index+1),children:children.map(c=>c[0]),category:`${title} · 核心分支`,summary:desc,why};positions[id]={x:270,y};newEdges.push({source:root,target:id,type:'structure'});
    children.forEach((child,ci)=>{const [cid,ctitle,cdesc]=child;const cy=y-22+ci*72;newNodes[cid]={title:ctitle,desc:cdesc,x:510,y:cy,type:'segment',icon:'◇',children:[],category:`${label} · 细分环节`,summary:cdesc,why:`这是${label}中的关键组成部分，需要继续研究其成本、产能、技术路线与上下游关系。`};positions[cid]={x:510,y:cy};newEdges.push({source:id,target:cid,type:'structure'});newResearch[cid]={dims:[['继续拆解','产品 · 工艺 · 设备'],['关键指标','产能 · 成本 · 效率'],['主要瓶颈','供需 · 良率 · 技术'],['技术路线','等待 AI 深入研究']],rels:[[label,'包含',ctitle],[ctitle,'价值传导','下游应用']]};});
  });
  return {title,rootId:root,nodes:newNodes,edges:newEdges,nodePositions:positions,researchData:newResearch,expanded:[root,...branchData.map(b=>b[0])],selected:isSolar?'cell':branchData[1][0]};
}

function updateProjectChrome(){
  document.querySelector('.crumbs strong').textContent=projectTitle;
  document.querySelector('#aiCurrentProject').textContent=projectTitle;
  let button=document.querySelector(`.project[data-project-id="${currentProjectId}"]`);
  if(!button){
    button=document.createElement('button');button.className='project';button.dataset.projectId=currentProjectId;
    button.innerHTML=`<i class="project-dot green"></i><span>${escapeHtml(projectTitle)}<small>${Object.keys(nodes).length} 个节点 · AI 新建</small></span>`;
    document.querySelector('.sidebar-section').appendChild(button);
  }
  let projects={};try{projects=JSON.parse(localStorage.getItem(PROJECTS_KEY)||'{}')}catch(_){projects={}}
  Object.entries(projects).forEach(([id,project])=>{
    if(document.querySelector(`.project[data-project-id="${id}"]`))return;
    const item=document.createElement('button');item.className='project';item.dataset.projectId=id;
    item.innerHTML=`<i class="project-dot green"></i><span>${escapeHtml(project.title)}<small>${Object.keys(project.state?.nodes||{}).length} 个节点 · 已保存</small></span>`;
    document.querySelector('.sidebar-section').appendChild(item);
  });
  document.querySelectorAll('.project').forEach(item=>item.classList.toggle('active',item.dataset.projectId===currentProjectId));
}

function applyProject(project,id){
  Object.keys(nodes).forEach(key=>delete nodes[key]);Object.assign(nodes,JSON.parse(JSON.stringify(project.nodes)));
  edges.splice(0,edges.length,...JSON.parse(JSON.stringify(project.edges)));
  nodePositions=JSON.parse(JSON.stringify(project.nodePositions));researchData=JSON.parse(JSON.stringify(project.researchData||{}));evidenceData=JSON.parse(JSON.stringify(project.evidenceData||{}));researchTasks=JSON.parse(JSON.stringify(project.researchTasks||[]));companyData=JSON.parse(JSON.stringify(project.companyData||[]));activeCompanyId=companyData[0]?.id||null;companyCompareSelection.clear();mappingReviewSelection.clear();
  expanded=new Set(project.expanded||[project.rootId]);selected=project.selected||project.rootId;rootId=project.rootId;projectTitle=project.title||project.projectTitle;currentProjectId=id;
  ensureNodeMetadata();compareSelection.clear();updateCompareTray();acceptedPatchIds=new Set(project.acceptedPatchIds||[]);draftAccepted=false;history=[];zoom=.9;reviewVisible=false;
  document.querySelector('.ai-mode span').textContent=apiConfig.mode==='api'?String(pendingPatchCount()):currentProjectId==='ai-compute'?String(pendingPatchCount()):'0';
  updateProjectChrome();updateDetail(selected);render();setZoom(.9,false);saveState();updateUndoButton();
}

async function createIndustryFromAi(){
  const name=document.querySelector('#industryPrompt').value.trim();if(!name){showToast('请先输入要研究的行业');return;}
  const button=document.querySelector('#createIndustry');button.disabled=true;button.textContent='AI 正在生成结构…';
  saveState();
  try{
    let project;
    if(apiConfig.mode==='api'){const result=await requestIndustryFromApi(name);project=projectFromModelResult(result,name);}
    else{await new Promise(resolve=>setTimeout(resolve,650));project=buildIndustryProject(name);}
    applyProject(project,`ai-${Date.now()}`);closeAiStudio();showToast(`已创建“${project.title}”，原项目已保留`);
  }catch(error){showToast(`生成失败：${error.message}`);}
  finally{button.disabled=false;button.innerHTML='生成并创建项目 <span>→</span>';}
}

async function runAiModification(){
  const instruction=document.querySelector('#modifyPrompt').value.trim()||'检查当前产业图谱中缺失的重要节点、关系和解释，并提出必要修改。';
  const button=document.querySelector('#runModifyAi');button.disabled=true;button.innerHTML='AI 正在分析图谱…';
  try{
    if(apiConfig.mode==='api'){
      const patches=await requestPatchesFromApi(instruction);aiPatches=normalizeModelPatches(patches);closeAiStudio();setTimeout(()=>setMode('review'),120);
    }else{
      if(currentProjectId!=='ai-compute')throw new Error('演示模式只为 AI 算力项目配置了修改示例，请启用自定义 API');
      closeAiStudio();setTimeout(()=>setMode('review'),180);
    }
  }catch(error){showToast(`分析失败：${error.message}`);}
  finally{button.disabled=false;button.innerHTML='生成修改建议 <span>→</span>';}
}

function demoExpansionSpecs(nodeId){
  const node=nodes[nodeId],known=(node.children||[]).map(id=>nodes[id]?.title);let candidates;
  if(/光模块/.test(node.title))candidates=[['激光器芯片','提供高速光信号发射能力','激光器性能影响速率、功耗、寿命与成本。'],['光芯片与硅光','完成调制、探测及光路集成','集成路线决定光模块的性能、集成度与规模化成本。'],['封装与测试','完成光电器件耦合、封装和可靠性验证','耦合精度、良率与测试能力直接影响交付成本。']];
  else if(/芯片|半导体/.test(node.title))candidates=[['芯片设计','架构、IP 与电路设计','设计决定产品功能、性能与软件生态。'],['晶圆制造','制程、产能与良率','制造能力决定芯片能否稳定量产。'],['封装测试','封装集成与最终测试','先进封装和测试影响带宽、散热及成品率。']];
  else candidates=[['核心产品','主要产品形态与规格','产品结构决定产业价值如何落地。'],['关键工艺','制造流程、效率与良率','工艺能力决定成本、品质和规模化速度。'],['配套设备','生产、检测与系统配套','设备和配套能力可能形成产能或技术约束。']];
  return candidates.filter(item=>!known.includes(item[0])).map((item,index)=>({operation:'add_node',id:`expand_${Date.now()}_${index}`,parentId:nodeId,title:item[0],summary:item[1],why:item[2],category:`${node.title} · AI 继续拆解`,reason:`“${node.title}”目前缺少对${item[0]}的独立拆解，补充后更容易继续研究产品、工艺和指标。`}));
}
async function expandSelectedNodeAi(){
  const button=document.querySelector('#expandNodeAi'),node=nodes[selected];button.disabled=true;button.textContent='AI 分析中…';
  try{let specs;if(apiConfig.mode==='api')specs=await requestPatchesFromApi(`只继续拆解节点 ID=${selected}、标题“${node.title}”。新增 3 至 5 个互不重复的直接子节点，说明每个子节点是什么、为什么重要；不要改动其他分支。`);else{await new Promise(resolve=>setTimeout(resolve,420));specs=demoExpansionSpecs(selected);}if(!specs.length)throw new Error('没有发现需要新增的细分节点');aiPatches=normalizeModelPatches(specs);acceptedPatchIds=new Set();document.querySelector('.ai-mode span').textContent=String(aiPatches.length);setMode('review');showToast(`已生成“${node.title}”拆解方案，请逐项审阅`);}catch(error){showToast(`拆解失败：${error.message}`);}finally{button.disabled=false;button.textContent='✦ 继续拆解';}
}

function switchProject(id){
  if(id===currentProjectId)return;
  saveState();let projects={};try{projects=JSON.parse(localStorage.getItem(PROJECTS_KEY)||'{}')}catch(_){return}
  if(projects[id]?.state){applyProject(projects[id].state,id);showToast(`已切换至“${projects[id].title}”`);}
}

function setNavActive(name){document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item.dataset.nav===name));}
function closeBrowserModal(id){document.querySelector(id).classList.remove('open');document.querySelector(id).setAttribute('aria-hidden','true');setNavActive('graph');}

function evidenceLibraryItems(){
  return Object.entries(evidenceData).flatMap(([nodeId,sources])=>(sources||[]).map(source=>({...source,nodeId,nodeTitle:nodes[nodeId]?.title||'已删除节点'})));
}
function renderLibrary(){
  const q=document.querySelector('#librarySearch').value.trim().toLowerCase(),type=document.querySelector('#libraryFilter').value;
  const all=evidenceLibraryItems(),filtered=all.filter(item=>(type==='all'||item.type===type)&&[item.title,item.nodeTitle,item.quote,item.location].join(' ').toLowerCase().includes(q));
  document.querySelector('#libraryList').innerHTML=filtered.length?filtered.map(item=>`<article class="library-row" data-library-node="${escapeHtml(item.nodeId)}"><span class="source-icon ${escapeHtml(item.type.toLowerCase())}">${escapeHtml(item.type)}</span><div class="library-main"><strong>${escapeHtml(item.title)}</strong><span>关联节点：${escapeHtml(item.nodeTitle)} · ${escapeHtml(item.location||item.date||'未标注位置')}</span><small>${escapeHtml(item.quote||'暂无摘录')}</small></div><span class="library-status ${item.verified?'verified':''}">${item.verified?'已核验':'待核验'}</span></article>`).join(''):'<div class="empty-state">没有符合条件的资料</div>';
  document.querySelector('#libraryStats').textContent=`共 ${all.length} 条资料 · ${all.filter(item=>item.verified).length} 条已核验`;
  document.querySelectorAll('[data-library-node]').forEach(row=>row.addEventListener('click',()=>{focusGraphNode(row.dataset.libraryNode);closeBrowserModal('#libraryModal')}));
}
function documentNodeId(documentId){for(const [nodeId,sources] of Object.entries(evidenceData)){if((sources||[]).some(source=>source.documentId===documentId))return nodeId;}return selected;}
function setLibraryView(view){libraryView=view;document.querySelector('#librarySourcesTab').classList.toggle('active',view==='sources');document.querySelector('#libraryFilesTab').classList.toggle('active',view==='files');document.querySelector('#librarySourceToolbar').hidden=view!=='sources';document.querySelector('#libraryFileToolbar').hidden=view!=='files';if(view==='sources')renderLibrary();else loadDocumentTasks();}
function renderDocumentTasks(){
  const statusLabels={processing:'解析中',ocr_processing:'OCR 识别中',ready:'已解析',failed:'解析失败',ocr_failed:'OCR 失败'};document.querySelector('#libraryList').innerHTML=documentTaskCache.length?documentTaskCache.map(item=>{const nodeId=documentNodeId(item.id),nodeTitle=nodes[nodeId]?.title||'当前节点',canExtract=item.status==='ready'&&item.char_count>0,canOcr=['ready','ocr_failed'].includes(item.status)&&(item.needs_ocr||item.status==='ocr_failed');return `<article class="document-task-row"><span class="document-task-icon">PDF</span><div class="document-task-main"><strong>${escapeHtml(item.filename)}</strong><span>${item.page_count||0} 页 · ${(item.char_count||0).toLocaleString()} 字符 · ${item.table_count||0} 个表格 · 关联节点：${escapeHtml(nodeTitle)}</span><small>${item.error?escapeHtml(item.error):item.needs_ocr?'文本较少，建议运行本地中文 OCR':`${item.extraction_count||0} 次 AI 提取 · ${item.ocr_page_count?`${item.ocr_page_count} 页 OCR · `:''}更新于 ${new Date(item.updated_at).toLocaleString('zh-CN')}`}</small></div><div class="document-task-actions"><span class="document-status ${escapeHtml(item.status)}">${statusLabels[item.status]||escapeHtml(item.status)}</span>${item.status==='failed'?`<button data-document-retry="${escapeHtml(item.id)}">重试解析</button>`:''}${canOcr?`<button data-document-ocr="${escapeHtml(item.id)}">运行 OCR</button>`:''}${item.table_count?`<button data-document-tables="${escapeHtml(item.id)}">查看表格</button>`:''}${item.extraction_count?`<button data-document-history="${escapeHtml(item.id)}">提取记录</button>`:''}${canExtract?`<button class="primary" data-document-extract="${escapeHtml(item.id)}">✦ AI 提取</button>`:''}</div></article>`}).join(''):'<div class="empty-state">当前项目还没有文件任务，上传年报后会显示在这里</div>';
  document.querySelector('#libraryStats').textContent=`共 ${documentTaskCache.length} 份文件 · ${documentTaskCache.filter(item=>item.status==='ready').length} 份已解析 · ${documentTaskCache.reduce((sum,item)=>sum+(item.table_count||0),0)} 个表格`;
  document.querySelectorAll('[data-document-retry]').forEach(button=>button.addEventListener('click',()=>retryDocumentTask(button.dataset.documentRetry)));document.querySelectorAll('[data-document-ocr]').forEach(button=>button.addEventListener('click',()=>startDocumentOcr(button.dataset.documentOcr)));document.querySelectorAll('[data-document-tables]').forEach(button=>button.addEventListener('click',()=>openDocumentTables(button.dataset.documentTables)));document.querySelectorAll('[data-document-extract]').forEach(button=>button.addEventListener('click',()=>extractDocumentTask(button.dataset.documentExtract)));document.querySelectorAll('[data-document-history]').forEach(button=>button.addEventListener('click',()=>openDocumentExtractionHistory(button.dataset.documentHistory)));
}
async function loadDocumentTasks(){
  if(!cloudToken()||!cloudWorkspace()){documentTaskCache=[];document.querySelector('#libraryList').innerHTML='<div class="empty-state">请先连接后端研究空间，才能查看文件任务</div>';document.querySelector('#libraryStats').textContent='尚未连接后端';return;}const projectId=mappedCloudProjectId();if(!projectId){documentTaskCache=[];document.querySelector('#libraryList').innerHTML='<div class="empty-state">当前项目尚未同步；首次上传项目后即可管理文件任务</div>';document.querySelector('#libraryStats').textContent='项目尚未建立云端映射';return;}document.querySelector('#libraryList').innerHTML='<div class="empty-state">正在读取文件任务……</div>';try{documentTaskCache=await cloudRequest(`/api/documents?workspace_id=${encodeURIComponent(cloudWorkspace().id)}&project_id=${encodeURIComponent(projectId)}`);renderDocumentTasks();}catch(error){document.querySelector('#libraryList').innerHTML=`<div class="empty-state">读取失败：${escapeHtml(error.message)}</div>`;document.querySelector('#libraryStats').textContent='文件任务读取失败';}
}
async function retryDocumentTask(documentId){try{await cloudRequest(`/api/documents/${encodeURIComponent(documentId)}/retry`,{method:'POST'});showToast('已重新提交 PDF 解析');await loadDocumentTasks();}catch(error){showToast(`重试失败：${error.message}`);}}
async function startDocumentOcr(documentId){
  const item=documentTaskCache.find(document=>document.id===documentId);if(!item)return;try{await cloudRequest(`/api/documents/${encodeURIComponent(documentId)}/ocr`,{method:'POST'});item.status='ocr_processing';item.error=null;renderDocumentTasks();showToast('本地中文 OCR 已开始，可留在任务中心等待');for(let attempt=0;attempt<180;attempt++){await waitMs(1000);const status=await cloudRequest(`/api/documents/${encodeURIComponent(documentId)}`);Object.assign(item,status);renderDocumentTasks();if(!['processing','ocr_processing'].includes(status.status)){showToast(status.status==='ready'?`OCR 完成：识别 ${status.ocr_page_count} 页，共 ${status.char_count.toLocaleString()} 字符`:`OCR 失败：${status.error||'未知错误'}`);break;}}}catch(error){showToast(`OCR 提交失败：${error.message}`);await loadDocumentTasks();}
}
function closeDocumentTables(){const modal=document.querySelector('#tableModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
function renderSelectedDocumentTable(){
  const table=currentDocumentTables[Number(document.querySelector('#tableSelector').value)||0];if(!table){document.querySelector('#tablePreview').innerHTML='';return;}document.querySelector('#tablePreview').innerHTML=(table.data||[]).map((row,rowIndex)=>`<tr>${row.map(cell=>`<${rowIndex===0?'th':'td'}>${escapeHtml(cell||'')}</${rowIndex===0?'th':'td'}>`).join('')}</tr>`).join('');
}
async function openDocumentTables(documentId){
  const item=documentTaskCache.find(document=>document.id===documentId);if(!item)return;try{currentDocumentTables=await cloudRequest(`/api/documents/${encodeURIComponent(documentId)}/tables`);currentTableDocument=item;document.querySelector('#tableDialogTitle').textContent=`${item.filename} · 表格`;document.querySelector('#tableStats').textContent=`共识别 ${currentDocumentTables.length} 个表格，点击右侧切换页码`;document.querySelector('#tableSelector').innerHTML=currentDocumentTables.map((table,index)=>`<option value="${index}">第 ${table.page_number} 页 · 表格 ${table.table_number}（${table.row_count}×${table.column_count}）</option>`).join('');renderSelectedDocumentTable();closeBrowserModal('#libraryModal');const modal=document.querySelector('#tableModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');}catch(error){showToast(`读取表格失败：${error.message}`);}
}
function downloadCurrentTableCsv(){const table=currentDocumentTables[Number(document.querySelector('#tableSelector').value)||0];if(!table)return;const csv='\ufeff'+(table.data||[]).map(row=>row.map(cell=>`"${String(cell||'').replace(/"/g,'""')}"`).join(',')).join('\r\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${currentTableDocument?.filename||'annual-report'}-第${table.page_number}页-表格${table.table_number}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),500);showToast('当前年报表格已下载为 CSV');}
function attachCurrentTableToNode(){const table=currentDocumentTables[Number(document.querySelector('#tableSelector').value)||0];if(!table||!currentTableDocument)return;const nodeId=documentNodeId(currentTableDocument.id);if(!nodes[nodeId])return;const list=evidenceData[nodeId]||(evidenceData[nodeId]=[]);if(list.some(source=>source.tableId===table.id)){showToast('这个表格已经写入关联节点');return;}createSnapshot(`写入“${currentTableDocument.filename}”第 ${table.page_number} 页表格`);list.push({id:`source_table_${Date.now()}`,type:'ANNUAL',title:`${currentTableDocument.filename} · 第 ${table.page_number} 页表格 ${table.table_number}`,url:`backend-document:${currentTableDocument.id}`,date:new Date().toISOString().slice(0,10),location:`第 ${table.page_number} 页 · 表格 ${table.table_number}`,quote:(table.data||[]).slice(0,12).map(row=>row.join('｜')).join('\n').slice(0,1800),verified:false,documentId:currentTableDocument.id,tableId:table.id,tableData:table.data});nodes[nodeId].status='evidenced';nodes[nodeId].updatedAt=new Date().toISOString();selected=nodeId;updateDetail(nodeId);render();saveState('年报表格已写入节点资料');syncCurrentProject({silent:true}).catch(()=>{});closeDocumentTables();showToast(`表格已写入“${nodes[nodeId].title}”节点资料`);}
function extractDocumentTask(documentId){const item=documentTaskCache.find(document=>document.id===documentId);if(!item)return;const nodeId=documentNodeId(documentId);lastProcessedDocument={id:item.id,filename:item.filename,nodeId,cloudProjectId:item.project_id,pageCount:item.page_count,charCount:item.char_count};closeBrowserModal('#libraryModal');startDocumentExtraction();}
async function openDocumentExtractionHistory(documentId){const item=documentTaskCache.find(document=>document.id===documentId);if(!item)return;try{const history=await cloudRequest(`/api/documents/${encodeURIComponent(documentId)}/extractions`),latest=history.find(entry=>entry.status==='ready'&&entry.result);if(!latest){showToast('还没有可审核的成功提取结果');return;}lastProcessedDocument={id:item.id,filename:item.filename,nodeId:documentNodeId(documentId),cloudProjectId:item.project_id,pageCount:item.page_count,charCount:item.char_count};currentExtraction=latest;closeBrowserModal('#libraryModal');const modal=document.querySelector('#extractionModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.querySelector('#extractionCategory').value='all';renderExtractionFindings();}catch(error){showToast(`读取提取记录失败：${error.message}`);}}
function openLibrary(){document.querySelector('#libraryModal').classList.add('open');document.querySelector('#libraryModal').setAttribute('aria-hidden','false');setNavActive('library');setLibraryView(libraryView);}

const taskTypeLabels={structure:'产业拆解',explain:'解释完善',evidence:'寻找证据',verify:'人工核验',update:'信息更新'};
function nodeCoverage(id){
  const node=nodes[id],data=researchData[id],sources=evidenceData[id]||[],citations=node.citations||{},nonStructure=edges.filter(edge=>edge.type!=='structure'&&(edge.source===id||edge.target===id));let score=0,gaps=[];
  if((node.summary||'').length>=18)score+=15;else gaps.push({key:'summary',label:'缺少清晰解释'});
  if((node.why||'').length>=24)score+=15;else gaps.push({key:'why',label:'缺少重要性逻辑'});
  const usefulDims=(data?.dims||[]).filter(item=>item[1]&&!/待|点击|查看/.test(item[1])).length;score+=Math.round(usefulDims/4*20);if(usefulDims<4)gaps.push({key:'dimensions',label:'研究维度未完善'});
  if((node.children||[]).length||id!==rootId&&nonStructure.length)score+=10;else gaps.push({key:'structure',label:'尚未继续拆解'});
  if(sources.length)score+=15;else gaps.push({key:'evidence',label:'没有证据资料'});
  if(sources.some(source=>source.verified))score+=10;else gaps.push({key:'verify',label:'资料尚未核验'});
  const cited=Number((citations.summary||[]).length>0)+Number((citations.why||[]).length>0);score+=cited*5;if(cited<2)gaps.push({key:'citation',label:'结论缺少精确引用'});
  if(['edited','evidenced','verified'].includes(node.status))score+=5;else gaps.push({key:'status',label:node.status==='stale'?'内容需要更新':'尚未人工推进'});
  return {score:Math.min(100,score),gaps};
}
function projectCoverage(){const rows=Object.keys(nodes).map(id=>({id,...nodeCoverage(id)}));return {rows,score:rows.length?Math.round(rows.reduce((sum,row)=>sum+row.score,0)/rows.length):0};}
function renderDashboard(){
  const coverage=projectCoverage(),done=researchTasks.filter(task=>task.status==='done').length,verified=Object.values(nodes).filter(node=>node.status==='verified').length,evidenced=Object.keys(nodes).filter(id=>(evidenceData[id]||[]).length).length;
  document.querySelector('#projectScore').textContent=`${coverage.score}%`;document.querySelector('#projectProgressBar').style.width=`${coverage.score}%`;document.querySelector('#projectProgressText').textContent=`${projectTitle}共有 ${coverage.rows.length} 个节点；建议优先处理完整度最低的关键节点。`;
  document.querySelector('#dashboardStats').innerHTML=`<div class="dashboard-stat"><strong>${evidenced}</strong><span>已有资料节点</span></div><div class="dashboard-stat"><strong>${verified}</strong><span>已核验节点</span></div><div class="dashboard-stat"><strong>${done}/${researchTasks.length}</strong><span>已完成任务</span></div>`;
  renderTaskBoard();const weakest=[...coverage.rows].sort((a,b)=>a.score-b.score).slice(0,8);document.querySelector('#coverageGaps').innerHTML=weakest.map(row=>`<button class="gap-chip" data-gap-node="${escapeHtml(row.id)}">${escapeHtml(nodes[row.id].title)} <b>${row.score}%</b></button>`).join('');document.querySelectorAll('[data-gap-node]').forEach(button=>button.addEventListener('click',()=>{focusGraphNode(button.dataset.gapNode);closeDashboard()}));
}
function renderTaskBoard(){
  const filter=document.querySelector('#taskFilter').value,tasks=researchTasks.filter(task=>filter==='all'||task.status===filter).sort((a,b)=>({high:0,medium:1,low:2}[a.priority]-({high:0,medium:1,low:2}[b.priority])));
  document.querySelector('#taskBoard').innerHTML=tasks.length?tasks.map(task=>`<article class="task-card ${escapeHtml(task.status)}"><i class="task-priority ${escapeHtml(task.priority)}"></i><div class="task-main"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(nodes[task.nodeId]?.title||'已删除节点')} · ${escapeHtml(taskTypeLabels[task.type]||task.type)}</span><small>${escapeHtml(task.note||'暂无补充要求')}</small></div><div class="task-actions"><button data-task-focus="${escapeHtml(task.id)}">查看节点</button><button data-task-edit="${escapeHtml(task.id)}">编辑</button><button data-task-next="${escapeHtml(task.id)}">${task.status==='todo'?'开始':task.status==='doing'?'完成':'重新打开'}</button><button data-task-delete="${escapeHtml(task.id)}">×</button></div></article>`).join(''):'<div class="empty-state">当前筛选下没有研究任务</div>';
  document.querySelectorAll('[data-task-focus]').forEach(button=>button.addEventListener('click',()=>{const task=researchTasks.find(item=>item.id===button.dataset.taskFocus);if(task&&nodes[task.nodeId]){focusGraphNode(task.nodeId);closeDashboard()}}));document.querySelectorAll('[data-task-edit]').forEach(button=>button.addEventListener('click',()=>openTaskEditor(button.dataset.taskEdit)));document.querySelectorAll('[data-task-next]').forEach(button=>button.addEventListener('click',()=>advanceTask(button.dataset.taskNext)));document.querySelectorAll('[data-task-delete]').forEach(button=>button.addEventListener('click',()=>deleteTask(button.dataset.taskDelete)));
}
function openDashboard(){renderDashboard();const modal=document.querySelector('#dashboardModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');setNavActive('dashboard');}
function closeDashboard(){const modal=document.querySelector('#dashboardModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');setNavActive('graph');}
let editingTaskId=null;
function openTaskEditor(taskId=null,nodeId=selected){
  editingTaskId=taskId;const task=researchTasks.find(item=>item.id===taskId)||{};document.querySelector('#taskDialogTitle').textContent=taskId?'编辑研究任务':'新建研究任务';document.querySelector('#taskNode').innerHTML=Object.entries(nodes).map(([id,node])=>`<option value="${escapeHtml(id)}">${escapeHtml(node.title)}</option>`).join('');document.querySelector('#taskTitle').value=task.title||`完善“${nodes[nodeId]?.title||'当前节点'}”的产业研究`;document.querySelector('#taskNode').value=task.nodeId||nodeId;document.querySelector('#taskType').value=task.type||'explain';document.querySelector('#taskPriority').value=task.priority||'medium';document.querySelector('#taskStatus').value=task.status||'todo';document.querySelector('#taskNote').value=task.note||'';document.querySelector('#taskModal').classList.add('open');document.querySelector('#taskModal').setAttribute('aria-hidden','false');
}
function closeTaskEditor(){document.querySelector('#taskModal').classList.remove('open');document.querySelector('#taskModal').setAttribute('aria-hidden','true');}
function saveTask(event){event.preventDefault();createSnapshot(`${editingTaskId?'编辑':'新增'}研究任务`);const task={id:editingTaskId||`task_${Date.now()}`,title:document.querySelector('#taskTitle').value.trim(),nodeId:document.querySelector('#taskNode').value,type:document.querySelector('#taskType').value,priority:document.querySelector('#taskPriority').value,status:document.querySelector('#taskStatus').value,note:document.querySelector('#taskNote').value.trim(),createdAt:researchTasks.find(item=>item.id===editingTaskId)?.createdAt||new Date().toISOString()};const index=researchTasks.findIndex(item=>item.id===editingTaskId);if(index>=0)researchTasks[index]=task;else researchTasks.push(task);closeTaskEditor();if(document.querySelector('#dashboardModal').classList.contains('open'))renderDashboard();saveState('研究任务已保存');}
function advanceTask(id){const task=researchTasks.find(item=>item.id===id);if(!task)return;createSnapshot(`更新任务“${task.title}”`);task.status=task.status==='todo'?'doing':task.status==='doing'?'done':'todo';task.updatedAt=new Date().toISOString();renderDashboard();saveState(task.status==='done'?'研究任务已完成':'研究任务状态已更新');}
function deleteTask(id){const task=researchTasks.find(item=>item.id===id);if(!task||!confirm(`删除任务“${task.title}”？`))return;createSnapshot(`删除任务“${task.title}”`);researchTasks=researchTasks.filter(item=>item.id!==id);renderDashboard();saveState('研究任务已删除');}
function generateGapTasks(){
  const coverage=projectCoverage(),existing=new Set(researchTasks.filter(task=>task.status!=='done').map(task=>`${task.nodeId}:${task.type}`)),pending=[];
  [...coverage.rows].sort((a,b)=>a.score-b.score).some(row=>{const gap=row.gaps[0];if(!gap)return false;const type=gap.key==='structure'?'structure':gap.key==='evidence'?'evidence':gap.key==='verify'||gap.key==='citation'?'verify':gap.key==='status'&&nodes[row.id].status==='stale'?'update':'explain';if(existing.has(`${row.id}:${type}`))return false;pending.push({id:`task_auto_${Date.now()}_${pending.length}`,nodeId:row.id,title:`${gap.label}：${nodes[row.id].title}`,type,priority:row.score<30?'high':'medium',status:'todo',note:`当前完整度 ${row.score}%。完成标准：补齐“${gap.label}”，并在节点卡片中保存结果。`,createdAt:new Date().toISOString(),auto:true});existing.add(`${row.id}:${type}`);return pending.length>=8;});
  if(!pending.length){showToast('当前缺口已经都有对应任务');return;}createSnapshot(`自动生成 ${pending.length} 个研究任务`);researchTasks.push(...pending);renderDashboard();saveState(`已根据研究缺口生成 ${pending.length} 个任务`);
}

const statusLabels={unresearched:'尚未研究',ai:'AI 初稿',edited:'人工整理',evidenced:'已有证据',verified:'已核验',stale:'需要更新'};
function updateCompareTray(){
  const tray=document.querySelector('#compareTray');tray.classList.toggle('open',compareSelection.size>0);document.querySelector('#compareChips').innerHTML=[...compareSelection].filter(id=>nodes[id]).map(id=>`<span class="compare-chip">${escapeHtml(nodes[id].title)}<b data-compare-remove="${escapeHtml(id)}">×</b></span>`).join('');document.querySelector('#openCompare').disabled=compareSelection.size<2;document.querySelectorAll('[data-compare-remove]').forEach(button=>button.addEventListener('click',()=>{compareSelection.delete(button.dataset.compareRemove);updateCompareTray()}));
}
function addSelectedToCompare(){if(compareSelection.has(selected)){showToast('当前节点已经在对比篮中');closeMenus();return;}if(compareSelection.size>=3){showToast('最多同时比较 3 个节点，请先移除一个');closeMenus();return;}compareSelection.add(selected);updateCompareTray();showToast(`已将“${nodes[selected].title}”加入对比`);closeMenus();}
function nodeRelationSummary(id){const labels={supply:'供应',depend:'依赖',constraint:'制约',substitute:'替代',benefit:'受益'};return edges.filter(edge=>edge.type!=='structure'&&(edge.source===id||edge.target===id)).map(edge=>`${nodes[edge.source]?.title||edge.source} —${edge.label||labels[edge.type]||edge.type}→ ${nodes[edge.target]?.title||edge.target}`).join('；')||'暂无非结构关系';}
function comparisonRows(ids){
  return [
    ['节点',...ids.map(id=>`<b>${escapeHtml(nodes[id].title)}</b><small>${escapeHtml(nodes[id].category)}</small>`)],
    ['一句话解释',...ids.map(id=>escapeHtml(nodes[id].summary))],['为什么重要',...ids.map(id=>escapeHtml(nodes[id].why))],
    ['继续拆解',...ids.map(id=>(nodes[id].children||[]).map(child=>escapeHtml(nodes[child]?.title||child)).join(' · ')||'尚未拆解')],
    ['关键指标',...ids.map(id=>escapeHtml(getNodeResearch(id).dims?.[1]?.[1]||'待补充'))],['主要瓶颈',...ids.map(id=>escapeHtml(getNodeResearch(id).dims?.[2]?.[1]||'待补充'))],
    ['研究状态',...ids.map(id=>`${escapeHtml(statusLabels[nodes[id].status]||nodes[id].status)} <span class="coverage-pill">${nodeCoverage(id).score}%</span>`)],
    ['证据资料',...ids.map(id=>{const list=evidenceData[id]||[];return list.length?`${list.length} 条 · ${list.filter(source=>source.verified).length} 条已核验`:'暂无资料'})],
    ['结论引用',...ids.map(id=>`${(nodes[id].citations?.summary||[]).length?'解释已引用':'解释未引用'}；${(nodes[id].citations?.why||[]).length?'重要性已引用':'重要性未引用'}`)],
    ['产业关系',...ids.map(id=>escapeHtml(nodeRelationSummary(id)))],['未完成任务',...ids.map(id=>researchTasks.filter(task=>task.nodeId===id&&task.status!=='done').map(task=>escapeHtml(task.title)).join('；')||'暂无任务')]
  ];
}
function renderComparison(){const ids=[...compareSelection].filter(id=>nodes[id]),cols=`110px repeat(${ids.length},minmax(190px,1fr))`;document.querySelector('#comparisonTable').innerHTML=comparisonRows(ids).map((row,index)=>`<div class="comparison-row ${index===0?'header':''}" style="grid-template-columns:${cols}">${row.map(cell=>`<div class="comparison-cell">${cell}</div>`).join('')}</div>`).join('');}
function openComparison(){if(compareSelection.size<2){showToast('请至少加入两个节点');return;}renderComparison();document.querySelector('#compareModal').classList.add('open');document.querySelector('#compareModal').setAttribute('aria-hidden','false');}
function closeComparison(){document.querySelector('#compareModal').classList.remove('open');document.querySelector('#compareModal').setAttribute('aria-hidden','true');}
function comparisonText(){const ids=[...compareSelection].filter(id=>nodes[id]);return [`# ${ids.map(id=>nodes[id].title).join(' vs ')}`,...comparisonRows(ids).slice(1).map(row=>`\n## ${row[0]}\n${ids.map((id,index)=>`- **${nodes[id].title}**：${String(row[index+1]).replace(/<[^>]+>/g,'')}`).join('\n')}`)].join('\n');}

function orderedProjectNodes(){const result=[],seen=new Set();(function walk(id,depth){if(!nodes[id]||seen.has(id))return;seen.add(id);result.push({id,depth});(nodes[id].children||[]).forEach(child=>walk(child,depth+1));})(rootId,0);Object.keys(nodes).filter(id=>!seen.has(id)&&nodes[id].type!=='draft').forEach(id=>result.push({id,depth:1}));return result;}
function generateReportMarkdown(){
  const includeEvidence=document.querySelector('#reportEvidence').checked,includeTasks=document.querySelector('#reportTasks').checked,onlyExpanded=document.querySelector('#reportOnlyExpanded').checked,allowed=onlyExpanded?visibleSet():null,ordered=orderedProjectNodes().filter(item=>!allowed||allowed.has(item.id)),coverage=projectCoverage(),lines=[`# ${projectTitle}`,'',`> 生成时间：${new Date().toLocaleString('zh-CN')}  `,`> 项目研究完整度：${coverage.score}% · ${ordered.length} 个节点`,'','## 一、产业结构',''];
  ordered.forEach(({id,depth})=>lines.push(`${'  '.repeat(depth)}- **${nodes[id].title}** — ${nodes[id].desc||nodes[id].summary}（${statusLabels[nodes[id].status]||nodes[id].status}，完整度 ${nodeCoverage(id).score}%）`));lines.push('','## 二、节点研究','');
  ordered.forEach(({id})=>{const node=nodes[id],data=getNodeResearch(id),sources=evidenceData[id]||[],citations=node.citations||{};lines.push(`### ${node.title}`,'',`- 产业位置：${node.category}` ,`- 研究状态：${statusLabels[node.status]||node.status}` ,`- 研究完整度：${nodeCoverage(id).score}%`,'',`**一句话解释**：${node.summary}`);if((citations.summary||[]).length)lines.push(`  - 支持资料：${(citations.summary||[]).map(sourceId=>sources.find(source=>source.id===sourceId)?.title).filter(Boolean).join('；')}`);lines.push('',`**为什么重要**：${node.why}`);if((citations.why||[]).length)lines.push(`  - 支持资料：${(citations.why||[]).map(sourceId=>sources.find(source=>source.id===sourceId)?.title).filter(Boolean).join('；')}`);lines.push('','**研究维度**');(data.dims||[]).forEach(item=>lines.push(`- ${item[0]}：${item[1]}`));lines.push('','**关键关系**',`- ${nodeRelationSummary(id)}`);if(includeEvidence){lines.push('','**证据资料**');if(!sources.length)lines.push('- 暂无资料');sources.forEach(source=>lines.push(`- ${source.verified?'[已核验]':'[待核验]'} ${source.title}${source.date?`（${source.date}）`:''}${source.location?`，${source.location}`:''}${source.url?`：${source.url}`:''}${source.quote?`\n  - 摘录：${source.quote}`:''}`));}if(includeTasks){const tasks=researchTasks.filter(task=>task.nodeId===id&&task.status!=='done');if(tasks.length){lines.push('','**待完成任务**');tasks.forEach(task=>lines.push(`- [${task.status==='doing'?'>':' '}] ${task.title}（${taskTypeLabels[task.type]} / ${task.priority}）`));}}lines.push('','---','');});return {text:lines.join('\n'),nodes:ordered.length};
}
function refreshReport(){const report=generateReportMarkdown();document.querySelector('#reportPreview').textContent=report.text;document.querySelector('#reportStats').textContent=`${report.nodes} 个节点 · ${report.text.length.toLocaleString()} 个字符`;return report;}
function openReport(){closeMenus();refreshReport();document.querySelector('#reportModal').classList.add('open');document.querySelector('#reportModal').setAttribute('aria-hidden','false');}
function closeReport(){document.querySelector('#reportModal').classList.remove('open');document.querySelector('#reportModal').setAttribute('aria-hidden','true');}
function downloadReport(){const report=refreshReport(),blob=new Blob([report.text],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${projectTitle}-研究报告.md`;link.click();setTimeout(()=>URL.revokeObjectURL(url),500);showToast('Markdown 研究报告已下载');}
async function downloadPreciseReport(){
  if(!cloudToken()||!cloudWorkspace()){closeReport();openCloud();showToast('精准导出需要先连接后端研究空间');return;}const button=document.querySelector('#downloadPreciseReport'),format=document.querySelector('#preciseExportFormat').value;button.disabled=true;button.textContent='正在生成…';try{const project=await syncCurrentProject({silent:true}),params=new URLSearchParams({format,include_evidence:String(document.querySelector('#reportEvidence').checked),include_tasks:String(document.querySelector('#reportTasks').checked),only_expanded:String(document.querySelector('#reportOnlyExpanded').checked)}),response=await fetch(`${saveBackendUrl()}/api/projects/${encodeURIComponent(project.id)}/export?${params}`,{headers:{Authorization:`Bearer ${cloudToken()}`}});if(!response.ok){let detail=`后端返回 ${response.status}`;try{detail=(await response.json()).detail||detail}catch(_){}throw new Error(detail);}const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${projectTitle}-研究报告.${format}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),800);showToast(`${format.toUpperCase()} 精准报告已生成`);}catch(error){showToast(`精准导出失败：${error.message}`);}finally{button.disabled=false;button.textContent='精准导出';}
}

function applySnapshotState(state){
  Object.keys(nodes).forEach(key=>delete nodes[key]);Object.assign(nodes,JSON.parse(JSON.stringify(state.nodes)));
  edges.splice(0,edges.length,...JSON.parse(JSON.stringify(state.edges)));nodePositions=JSON.parse(JSON.stringify(state.nodePositions));expanded=new Set(state.expanded);selected=state.selected;draftAccepted=state.draftAccepted;acceptedPatchIds=new Set(state.acceptedPatchIds||[]);researchData=JSON.parse(JSON.stringify(state.researchData||{}));evidenceData=JSON.parse(JSON.stringify(state.evidenceData||{}));researchTasks=JSON.parse(JSON.stringify(state.researchTasks||[]));companyData=JSON.parse(JSON.stringify(state.companyData||[]));activeCompanyId=companyData[0]?.id||null;companyCompareSelection.clear();mappingReviewSelection.clear();rootId=state.rootId||rootId;ensureNodeMetadata();
  updateDetail(selected);render();saveState();updateUndoButton();
}
function renderSnapshots(){
  document.querySelector('#snapshotCount').textContent=String(history.length);
  document.querySelector('#snapshotList').innerHTML=history.length?[...history].map((entry,index)=>({entry,index})).reverse().map(({entry,index})=>`<article class="snapshot-row"><span class="snapshot-icon">↶</span><span><strong>${escapeHtml(entry.reason)}</strong><small>${new Date(entry.at).toLocaleString('zh-CN')}</small></span><button data-restore-index="${index}">恢复此版本</button></article>`).join(''):'<div class="empty-state">还没有修改历史；编辑节点或手动创建快照后会显示在这里</div>';
  document.querySelectorAll('[data-restore-index]').forEach(button=>button.addEventListener('click',()=>restoreSnapshot(Number(button.dataset.restoreIndex))));
}
function openSnapshots(){renderSnapshots();document.querySelector('#snapshotsModal').classList.add('open');document.querySelector('#snapshotsModal').setAttribute('aria-hidden','false');setNavActive('snapshots');}
function restoreSnapshot(index){const entry=history[index];if(!entry||!confirm(`恢复到“${entry.reason}”之前的状态？`))return;createSnapshot('恢复历史版本前的当前状态');applySnapshotState(entry.state);renderSnapshots();showToast('历史版本已恢复，可继续撤销');}

function focusGraphNode(id){
  if(!nodes[id])return;function findPath(current,target,path=[]){if(current===target)return [...path,current];for(const child of nodes[current]?.children||[]){const result=findPath(child,target,[...path,current]);if(result)return result;}return null}const path=findPath(rootId,id)||[];path.forEach(nodeId=>expanded.add(nodeId));selected=id;updateDetail(id);render();saveState();
}

function renameCurrentProject(){const next=prompt('新的项目名称',projectTitle);if(!next?.trim()||next.trim()===projectTitle)return;projectTitle=next.trim();updateProjectChrome();saveState('项目已重命名');closeMenus();}
function duplicateCurrentProject(){saveState();const state=JSON.parse(localStorage.getItem(STORAGE_KEY)),id=`copy-${Date.now()}`,title=`${projectTitle} 副本`;state.projectId=id;state.projectTitle=title;state.title=title;state.history=[];applyProject(state,id);showToast('已复制为独立项目');closeMenus();}
function deleteCurrentProject(){if(currentProjectId==='ai-compute'){showToast('默认示例项目不能删除，可以复制后继续研究');return;}if(!confirm(`删除项目“${projectTitle}”？请先导出需要保留的数据。`))return;let projects={};try{projects=JSON.parse(localStorage.getItem(PROJECTS_KEY)||'{}')}catch(_){return}const deletedId=currentProjectId;delete projects[deletedId];localStorage.setItem(PROJECTS_KEY,JSON.stringify(projects));document.querySelector(`.project[data-project-id="${deletedId}"]`)?.remove();const fallback=projects['ai-compute']?.state;if(fallback)applyProject(fallback,'ai-compute');else location.reload();showToast('项目已删除');}

function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text).catch(()=>fallbackCopy(text));fallbackCopy(text)}
function fallbackCopy(text){const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();}
function exportJson(data,filename){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function exportSelectedNode(){exportJson({nodeId:selected,node:nodes[selected],coverage:nodeCoverage(selected),research:getNodeResearch(selected),evidence:evidenceData[selected]||[],tasks:researchTasks.filter(task=>task.nodeId===selected),relations:edges.filter(e=>e.source===selected||e.target===selected)},`${nodes[selected].title}-research.json`);showToast('节点研究数据已导出');closeMenus();}
function deleteSelectedNode(){if(selected===rootId){showToast('产业根节点不能删除');return;}const title=nodes[selected].title;if(!confirm(`删除节点“${title}”及其子节点？`))return;createSnapshot(`删除节点“${title}”`);const remove=new Set();(function collect(id){remove.add(id);(nodes[id]?.children||[]).forEach(collect)})(selected);Object.values(nodes).forEach(node=>{node.children=(node.children||[]).filter(id=>!remove.has(id))});remove.forEach(id=>{delete nodes[id];delete nodePositions[id];delete researchData[id];delete evidenceData[id];compareSelection.delete(id)});updateCompareTray();researchTasks=researchTasks.filter(task=>!remove.has(task.nodeId));for(let i=edges.length-1;i>=0;i--)if(remove.has(edges[i].source)||remove.has(edges[i].target))edges.splice(i,1);selected=rootId;updateDetail(rootId);render();saveState('节点、子节点及关联任务已删除');closeMenus();}
function closeMenus(){document.querySelectorAll('.dropdown-menu').forEach(menu=>menu.classList.remove('open'));}

async function askNodeQuestion(){
  const input=document.querySelector('#askInput'),question=input.value.trim();if(!question)return;const button=document.querySelector('#askSend');button.disabled=true;button.textContent='…';
  try{let answer;if(apiConfig.mode==='api'){const result=await callConfiguredModel('你是产业研究助手。只返回 JSON：{"answer":"回答"}。回答必须围绕给定节点，区分事实、推断和待核实内容。',`节点：${JSON.stringify({title:nodes[selected].title,summary:nodes[selected].summary,why:nodes[selected].why,research:getNodeResearch(selected),evidence:evidenceData[selected]||[]})}\n问题：${question}`);answer=result.answer||JSON.stringify(result);}else{answer=`${nodes[selected].summary} ${nodes[selected].why} 当前是演示模式；接入 API 后，会结合节点资料回答“${question}”，并区分已有证据与待核实判断。`;}
    document.querySelector('#nodeAnswerText').textContent=answer;document.querySelector('#nodeAnswer').classList.add('open');input.value='';
  }catch(error){showToast(`回答失败：${error.message}`);}finally{button.disabled=false;button.textContent='↑';}
}

document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');applyFilter(b.dataset.filter)}));
document.querySelector('#graphSearch').addEventListener('input',applySearch);
document.querySelector('#zoomIn').addEventListener('click',()=>setZoom(zoom+.1));
document.querySelector('#zoomOut').addEventListener('click',()=>setZoom(zoom-.1));
document.querySelector('#fitView').addEventListener('click',()=>setZoom(.85));
document.querySelector('#collapseAll').addEventListener('click',()=>{expanded=new Set([rootId]);selected=rootId;updateDetail(rootId);render();saveState('已收起到产业总览')});
document.querySelector('#focusBtn').addEventListener('click',()=>{document.querySelectorAll('.graph-node').forEach(el=>el.classList.toggle('dim',el.dataset.id!==selected&&!edges.some(e=>(e.source===selected&&e.target===el.dataset.id)||(e.target===selected&&e.source===el.dataset.id))));showToast('已聚焦当前节点的一跳关系')});
document.querySelector('#aiOpen').addEventListener('click',()=>openAiStudio('modify'));
document.querySelector('#closeReview').addEventListener('click',()=>closeReview());
document.querySelector('#acceptBatch').addEventListener('click',acceptDrafts);
document.querySelector('#rejectBatch').addEventListener('click',rejectDrafts);
document.querySelector('.mini-ai').addEventListener('click',()=>{document.querySelector('#askInput').value=`请用不需要行业背景的语言解释“${nodes[selected].title}”，并举一个具体例子。`;askNodeQuestion()});
document.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#askInput').value=b.textContent;document.querySelector('#askInput').focus()}));
document.querySelector('#askSend').addEventListener('click',askNodeQuestion);
document.querySelector('#askInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();askNodeQuestion()}});
document.querySelector('#closeAnswer').addEventListener('click',()=>document.querySelector('#nodeAnswer').classList.remove('open'));
document.querySelector('#exportData').addEventListener('click',exportWorkspace);
document.querySelector('#importData').addEventListener('click',()=>document.querySelector('#importFile').click());
document.querySelector('#importFile').addEventListener('change',e=>{if(e.target.files[0])importWorkspace(e.target.files[0])});
document.querySelector('#resetData').addEventListener('click',()=>{if(confirm('恢复初始示例？所有本地项目和修改将被清除，请先导出备份。')){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(PROJECTS_KEY);location.reload();}});
document.querySelector('#editCard').addEventListener('click',openResearchEditor);
document.querySelector('#addNodeTask').addEventListener('click',()=>openTaskEditor(null,selected));
document.querySelector('#expandNodeAi').addEventListener('click',expandSelectedNodeAi);
document.querySelector('#nodeStatus').addEventListener('change',e=>{createSnapshot(`更新“${nodes[selected].title}”研究状态`);nodes[selected].status=e.target.value;nodes[selected].updatedAt=new Date().toISOString();updateDetail(selected);render();saveState('节点研究状态已更新')});
document.querySelector('#closeEditor').addEventListener('click',closeResearchEditor);
document.querySelector('#cancelEditor').addEventListener('click',closeResearchEditor);
document.querySelector('#editorModal').addEventListener('click',e=>{if(e.target.id==='editorModal')closeResearchEditor()});
document.querySelector('#researchForm').addEventListener('submit',saveResearchCard);
document.querySelector('#undoAction').addEventListener('click',undoLastChange);
document.querySelectorAll('.ai-tab').forEach(tab=>tab.addEventListener('click',()=>openAiStudio(tab.dataset.aiTab)));
document.querySelector('#closeAiStudio').addEventListener('click',closeAiStudio);
document.querySelector('#aiStudioModal').addEventListener('click',e=>{if(e.target.id==='aiStudioModal')closeAiStudio()});
document.querySelector('#useExamplePrompt').addEventListener('click',()=>{document.querySelector('#modifyPrompt').value='补充光模块的上游环节，检查是否缺少硅光和 CPO，并说明每项修改的具体理由。'});
document.querySelector('#runModifyAi').addEventListener('click',runAiModification);
document.querySelector('#createIndustry').addEventListener('click',createIndustryFromAi);
document.querySelector('#industryPrompt').addEventListener('input',e=>{const name=e.target.value.trim()||'新行业';document.querySelector('#generationPreview strong').textContent=name;document.querySelector('#generationPreview small').textContent=name.includes('光伏')?'预计生成 13 个核心节点、12 条结构关系':'将生成产业通用骨架，可继续由 AI 深入拆解';});
document.querySelector('.sidebar-section').addEventListener('click',e=>{
  const project=e.target.closest('.project');if(!project)return;
  if(project.dataset.projectId){switchProject(project.dataset.projectId);return;}
  if(project.dataset.seed){saveState();const generated=buildIndustryProject(project.dataset.seed),id=`seed-${Date.now()}`;applyProject(generated,id);project.dataset.projectId=id;delete project.dataset.seed;showToast(`已创建“${generated.title}”研究项目`);}
});
document.querySelector('#aiSettingsOpen').addEventListener('click',openAiSettings);
document.querySelector('#studioSettings').addEventListener('click',openAiSettings);
document.querySelector('#closeAiSettings').addEventListener('click',closeAiSettings);
document.querySelector('#cancelAiSettings').addEventListener('click',closeAiSettings);
document.querySelector('#aiSettingsModal').addEventListener('click',e=>{if(e.target.id==='aiSettingsModal')closeAiSettings()});
document.querySelector('#apiSettingsForm').addEventListener('submit',saveApiSettings);
document.querySelectorAll('input[name="runtimeMode"]').forEach(radio=>radio.addEventListener('change',updateApiFieldsState));
document.querySelector('#apiProvider').addEventListener('change',e=>applyProviderPreset(e.target.value,true));
document.querySelector('#toggleApiKey').addEventListener('click',()=>{const input=document.querySelector('#apiKey');input.type=input.type==='password'?'text':'password';document.querySelector('#toggleApiKey').textContent=input.type==='password'?'显示':'隐藏'});
document.querySelector('#testConnection').addEventListener('click',testApiConnection);
document.querySelector('#addSource').addEventListener('click',()=>openSourceEditor());
document.querySelector('#closeSource').addEventListener('click',closeSourceEditor);document.querySelector('#cancelSource').addEventListener('click',closeSourceEditor);document.querySelector('#sourceModal').addEventListener('click',e=>{if(e.target.id==='sourceModal')closeSourceEditor()});document.querySelector('#sourceForm').addEventListener('submit',saveSource);
document.querySelector('#addRelation').addEventListener('click',openRelationEditor);document.querySelector('#closeRelation').addEventListener('click',closeRelationEditor);document.querySelector('#cancelRelation').addEventListener('click',closeRelationEditor);document.querySelector('#relationModal').addEventListener('click',e=>{if(e.target.id==='relationModal')closeRelationEditor()});document.querySelector('#relationForm').addEventListener('submit',saveRelation);
document.querySelector('#closeCitation').addEventListener('click',closeCitationEditor);document.querySelector('#cancelCitation').addEventListener('click',closeCitationEditor);document.querySelector('#citationModal').addEventListener('click',e=>{if(e.target.id==='citationModal')closeCitationEditor()});document.querySelector('#citationForm').addEventListener('submit',saveCitations);document.querySelector('#citationAddSource').addEventListener('click',()=>{citationReturnAfterSource=true;closeCitationEditor();openSourceEditor()});
document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{
  if(item.dataset.nav==='dashboard'){document.querySelector('#libraryModal').classList.remove('open');document.querySelector('#snapshotsModal').classList.remove('open');document.querySelector('#companiesModal').classList.remove('open');openDashboard();}else if(item.dataset.nav==='library'){document.querySelector('#dashboardModal').classList.remove('open');document.querySelector('#companiesModal').classList.remove('open');openLibrary();}else if(item.dataset.nav==='companies'){document.querySelector('#dashboardModal').classList.remove('open');document.querySelector('#libraryModal').classList.remove('open');openCompanies();}else if(item.dataset.nav==='snapshots'){document.querySelector('#dashboardModal').classList.remove('open');document.querySelector('#companiesModal').classList.remove('open');openSnapshots();}else{document.querySelector('#dashboardModal').classList.remove('open');document.querySelector('#libraryModal').classList.remove('open');document.querySelector('#snapshotsModal').classList.remove('open');document.querySelector('#companiesModal').classList.remove('open');setNavActive('graph');}
}));
document.querySelector('#closeDashboard').addEventListener('click',closeDashboard);document.querySelector('#dashboardModal').addEventListener('click',e=>{if(e.target.id==='dashboardModal')closeDashboard()});document.querySelector('#taskFilter').addEventListener('change',renderTaskBoard);document.querySelector('#generateTasks').addEventListener('click',generateGapTasks);document.querySelector('#createTask').addEventListener('click',()=>openTaskEditor());
document.querySelector('#closeCompanies').addEventListener('click',closeCompanies);document.querySelector('#companiesModal').addEventListener('click',e=>{if(e.target.id==='companiesModal')closeCompanies()});document.querySelector('#companySearch').addEventListener('input',renderCompanyList);document.querySelector('#openNodeCompanies').addEventListener('click',()=>openCompanies(companyData.find(company=>(company.mappings||[]).some(mapping=>mapping.nodeId===selected&&mapping.status!=='rejected'))?.id||null));
document.querySelector('#createCompany').addEventListener('click',()=>openCompanyEditor());document.querySelector('#closeCompanyEditor').addEventListener('click',closeCompanyEditor);document.querySelector('#cancelCompanyEditor').addEventListener('click',closeCompanyEditor);document.querySelector('#companyEditorModal').addEventListener('click',e=>{if(e.target.id==='companyEditorModal')closeCompanyEditor()});document.querySelector('#companyForm').addEventListener('submit',saveCompanyProfile);document.querySelector('#companyDetail').addEventListener('click',e=>{if(e.target.closest('#editCompanyProfile'))openCompanyEditor(activeCompanyId);else if(e.target.closest('#deleteCompanyProfile'))deleteActiveCompany();else if(e.target.closest('#addManualCompanyMapping'))addManualCompanyMapping();else if(e.target.closest('#toggleActiveCompanyCompare'))toggleCompanyCompare(activeCompanyId);});
document.querySelector('#openCompanyCompare').addEventListener('click',openCompanyComparison);document.querySelector('#closeCompanyCompare').addEventListener('click',closeCompanyComparison);document.querySelector('#companyCompareModal').addEventListener('click',e=>{if(e.target.id==='companyCompareModal')closeCompanyComparison()});document.querySelector('#copyCompanyComparison').addEventListener('click',()=>{copyText(companyComparisonText());showToast('公司对比摘要已复制')});document.querySelector('#syncCompanyMaster').addEventListener('click',syncWorkspaceCompanyMaster);document.querySelector('#exportCompanies').addEventListener('click',exportCompanyMaster);document.querySelector('#importCompanies').addEventListener('click',()=>document.querySelector('#companyImportFile').click());document.querySelector('#companyImportFile').addEventListener('change',e=>{const file=e.target.files[0];e.target.value='';if(file)importCompanyMaster(file)});
document.querySelector('#openMappingReview').addEventListener('click',openMappingReview);document.querySelector('#closeMappingReview').addEventListener('click',closeMappingReview);document.querySelector('#mappingReviewModal').addEventListener('click',e=>{if(e.target.id==='mappingReviewModal')closeMappingReview()});document.querySelector('#mappingReviewSearch').addEventListener('input',renderMappingReview);document.querySelector('#selectAllMappings').addEventListener('change',selectAllVisibleMappings);document.querySelector('#confirmSelectedMappings').addEventListener('click',()=>applyBatchMappingStatus('confirmed'));document.querySelector('#rejectSelectedMappings').addEventListener('click',()=>applyBatchMappingStatus('rejected'));
document.querySelector('#closeTask').addEventListener('click',closeTaskEditor);document.querySelector('#cancelTask').addEventListener('click',closeTaskEditor);document.querySelector('#taskModal').addEventListener('click',e=>{if(e.target.id==='taskModal')closeTaskEditor()});document.querySelector('#taskForm').addEventListener('submit',saveTask);
document.querySelector('#closeLibrary').addEventListener('click',()=>closeBrowserModal('#libraryModal'));
document.querySelector('#libraryModal').addEventListener('click',e=>{if(e.target.id==='libraryModal')closeBrowserModal('#libraryModal')});
document.querySelector('#librarySearch').addEventListener('input',renderLibrary);document.querySelector('#libraryFilter').addEventListener('change',renderLibrary);
document.querySelector('#librarySourcesTab').addEventListener('click',()=>setLibraryView('sources'));document.querySelector('#libraryFilesTab').addEventListener('click',()=>setLibraryView('files'));document.querySelector('#refreshDocuments').addEventListener('click',loadDocumentTasks);
document.querySelector('#libraryAddCurrent').addEventListener('click',()=>{closeBrowserModal('#libraryModal');openSourceEditor()});
document.querySelector('#closeSnapshots').addEventListener('click',()=>closeBrowserModal('#snapshotsModal'));
document.querySelector('#snapshotsModal').addEventListener('click',e=>{if(e.target.id==='snapshotsModal')closeBrowserModal('#snapshotsModal')});
document.querySelector('#createManualSnapshot').addEventListener('click',()=>{createSnapshot('手动创建的研究快照');saveState();renderSnapshots();showToast('已创建当前版本快照')});
document.querySelector('#newResearch').addEventListener('click',()=>openAiStudio('create'));
document.querySelector('#workspaceProfile').addEventListener('click',openCloud);document.querySelector('#cloudStatus').addEventListener('click',openCloud);
document.querySelector('#closeCloud').addEventListener('click',closeCloud);document.querySelector('#closeCloudFooter').addEventListener('click',closeCloud);document.querySelector('#cloudModal').addEventListener('click',e=>{if(e.target.id==='cloudModal')closeCloud()});document.querySelector('#testBackend').addEventListener('click',testBackendConnection);document.querySelector('#devLogin').addEventListener('click',devCloudLogin);document.querySelector('#logoutCloud').addEventListener('click',logoutCloud);document.querySelector('#syncProject').addEventListener('click',()=>syncCurrentProject().catch(()=>{}));
document.querySelector('#uploadPdf').addEventListener('click',()=>{if(!cloudToken()){closeBrowserModal('#libraryModal');openCloud();showToast('请先连接后端，再上传 PDF');return;}document.querySelector('#pdfFile').click()});document.querySelector('#pdfFile').addEventListener('change',e=>{const file=e.target.files[0];e.target.value='';if(file)uploadPdfFile(file)});document.querySelector('#closeDocument').addEventListener('click',closeDocumentProgress);document.querySelector('#documentDone').addEventListener('click',closeDocumentProgress);document.querySelector('#documentModal').addEventListener('click',e=>{if(e.target.id==='documentModal')closeDocumentProgress()});
document.querySelector('#documentExtract').addEventListener('click',startDocumentExtraction);document.querySelector('#closeExtraction').addEventListener('click',closeExtraction);document.querySelector('#extractionModal').addEventListener('click',e=>{if(e.target.id==='extractionModal')closeExtraction()});document.querySelector('#extractionCategory').addEventListener('change',renderExtractionFindings);document.querySelector('#retryExtraction').addEventListener('click',startDocumentExtraction);document.querySelector('#acceptExtraction').addEventListener('click',()=>{document.querySelector('#extractionCategory').value='all';renderExtractionFindings();acceptExtractionFindings()});
document.querySelector('#closeTables').addEventListener('click',closeDocumentTables);document.querySelector('#tableModal').addEventListener('click',e=>{if(e.target.id==='tableModal')closeDocumentTables()});document.querySelector('#tableSelector').addEventListener('change',renderSelectedDocumentTable);document.querySelector('#attachTableToNode').addEventListener('click',attachCurrentTableToNode);document.querySelector('#downloadTableCsv').addEventListener('click',downloadCurrentTableCsv);
document.querySelector('#projectMenuToggle').addEventListener('click',e=>{e.stopPropagation();document.querySelector('#nodeMenu').classList.remove('open');document.querySelector('#projectMenu').classList.toggle('open')});
document.querySelector('#nodeMenuToggle').addEventListener('click',e=>{e.stopPropagation();document.querySelector('#projectMenu').classList.remove('open');document.querySelector('#nodeMenu').classList.toggle('open')});
document.querySelector('#renameProject').addEventListener('click',renameCurrentProject);document.querySelector('#duplicateProject').addEventListener('click',duplicateCurrentProject);document.querySelector('#exportProjectMenu').addEventListener('click',()=>{exportWorkspace();closeMenus()});document.querySelector('#deleteProject').addEventListener('click',deleteCurrentProject);
document.querySelector('#generateReportMenu').addEventListener('click',openReport);
document.querySelector('#addToCompare').addEventListener('click',addSelectedToCompare);document.querySelector('#clearCompare').addEventListener('click',()=>{compareSelection.clear();updateCompareTray()});document.querySelector('#openCompare').addEventListener('click',openComparison);document.querySelector('#closeCompare').addEventListener('click',closeComparison);document.querySelector('#compareModal').addEventListener('click',e=>{if(e.target.id==='compareModal')closeComparison()});document.querySelector('#copyComparison').addEventListener('click',()=>{copyText(comparisonText());showToast('节点对比摘要已复制')});
document.querySelector('#closeReport').addEventListener('click',closeReport);document.querySelector('#reportModal').addEventListener('click',e=>{if(e.target.id==='reportModal')closeReport()});document.querySelectorAll('#reportEvidence,#reportTasks,#reportOnlyExpanded').forEach(input=>input.addEventListener('change',refreshReport));document.querySelector('#refreshReport').addEventListener('click',refreshReport);document.querySelector('#copyReport').addEventListener('click',()=>{copyText(refreshReport().text);showToast('Markdown 报告已复制')});document.querySelector('#downloadReport').addEventListener('click',downloadReport);
document.querySelector('#downloadPreciseReport').addEventListener('click',downloadPreciseReport);
document.querySelector('#copyNodeSummary').addEventListener('click',()=>{const n=nodes[selected];copyText(`${n.title}\n${n.summary}\n\n为什么重要：${n.why}`);showToast('节点摘要已复制');closeMenus()});
document.querySelector('#focusNodeAction').addEventListener('click',()=>{focusGraphNode(selected);document.querySelector('#focusBtn').click();closeMenus()});document.querySelector('#exportNode').addEventListener('click',exportSelectedNode);document.querySelector('#deleteNode').addEventListener('click',deleteSelectedNode);
document.addEventListener('click',e=>{if(!e.target.closest('.dropdown-menu')&&!e.target.closest('#projectMenuToggle')&&!e.target.closest('#nodeMenuToggle'))closeMenus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#extractionModal').classList.contains('open'))closeExtraction()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#tableModal').classList.contains('open'))closeDocumentTables()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#companiesModal').classList.contains('open'))closeCompanies()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#companyEditorModal').classList.contains('open'))closeCompanyEditor()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#companyCompareModal').classList.contains('open'))closeCompanyComparison()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#mappingReviewModal').classList.contains('open'))closeMappingReview()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();document.querySelector('#nodeAnswer').classList.remove('open');if(document.querySelector('#cloudModal').classList.contains('open'))closeCloud();if(document.querySelector('#documentModal').classList.contains('open'))closeDocumentProgress();if(document.querySelector('#compareModal').classList.contains('open'))closeComparison();if(document.querySelector('#reportModal').classList.contains('open'))closeReport();if(document.querySelector('#dashboardModal').classList.contains('open'))closeDashboard();if(document.querySelector('#taskModal').classList.contains('open'))closeTaskEditor();if(document.querySelector('#libraryModal').classList.contains('open'))closeBrowserModal('#libraryModal');if(document.querySelector('#snapshotsModal').classList.contains('open'))closeBrowserModal('#snapshotsModal');if(document.querySelector('#citationModal').classList.contains('open'))closeCitationEditor();if(document.querySelector('#editorModal').classList.contains('open'))closeResearchEditor();if(document.querySelector('#aiStudioModal').classList.contains('open'))closeAiStudio();if(document.querySelector('#aiSettingsModal').classList.contains('open'))closeAiSettings();if(document.querySelector('#sourceModal').classList.contains('open'))closeSourceEditor();if(document.querySelector('#relationModal').classList.contains('open'))closeRelationEditor();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&![...document.querySelectorAll('.modal-backdrop')].some(modal=>modal.classList.contains('open'))){e.preventDefault();undoLastChange();}});

updateDetail(selected);
render();
setZoom(zoom, false);
document.querySelector('.ai-mode span').textContent=String(pendingPatchCount());
updateProjectChrome();
updateUndoButton();
refreshProviderStatus();
refreshCloudChrome();
saveState();
