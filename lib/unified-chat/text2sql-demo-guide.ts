/** Text2SQL 演示库说明（与 api-python `docs/text2sql/v1/sql/supabase_init.sql` 对齐） */

export type Text2SqlDemoTable = {
  /** Postgres 表名（public schema） */
  name: string;
  /** 业务域标签 */
  domain: string;
  /** 一行说明 */
  summary: string;
};

/** 样例库概览（面向访客，不含内部路径） */
export const TEXT2SQL_DEMO_INTRO =
  "本页 Unified Chat 除 RAG（检索博客/方法论文稿）外，还支持 Text2SQL：用自然语言查 Supabase Postgres 中的演示业务表。样例数据来自开源 Text2SQL 教程常见数据集（寿险 + 酒店订单 + 轻量游戏表），每表约 10 行，仅供能力演示。";

export const TEXT2SQL_DEMO_TABLES: readonly Text2SqlDemoTable[] = [
  {
    name: "agent_info",
    domain: "寿险",
    summary: "保险代理人档案：姓名、性别、执照、佣金结构（固定佣金 / 提成结构 / 底薪加提成）等。",
  },
  {
    name: "beneficiary_info",
    domain: "寿险",
    summary: "受益人信息：姓名、性别、国籍、联系方式。",
  },
  {
    name: "claim_info",
    domain: "寿险",
    summary: "理赔单：保单号、理赔类型与金额、状态、处理人与支付信息。",
  },
  {
    name: "customer_info",
    domain: "寿险",
    summary: "客户主档：身份、婚姻、职业、联系方式等。",
  },
  {
    name: "employee_info",
    domain: "寿险",
    summary: "公司员工：部门、职位、入职日期等（与保单/理赔处理人关联演示）。",
  },
  {
    name: "policy_info",
    domain: "寿险",
    summary: "保单：产品、投保人、起止日期、保费与状态。",
  },
  {
    name: "product_info",
    domain: "寿险",
    summary: "保险产品目录：类别、保障范围、费率区间等。",
  },
  {
    name: "crs_orders",
    domain: "酒店 CRS",
    summary: "酒店订单：下单时间、渠道、城市/省份、房晚、营收、入住退房日期等。",
  },
  {
    name: "heros",
    domain: "游戏演示",
    summary: "英雄属性：生命/攻击/防御、定位（坦克/战士/法师等），便于简单聚合与筛选练习。",
  },
] as const;

export const TEXT2SQL_DEMO_USAGE: readonly string[] = [
  "问法用口语即可；prefer=auto 时系统会自动在 RAG 与 Text2SQL 间路由（文稿类 → RAG，统计/查表类 → Text2SQL）。",
  "推荐 chip 中含 Text2SQL 示例；也可直接问「某表有多少条」「按日期统计订单」「男性代理人有几个」等。",
  "演示环境以只读 SELECT 为主；物理 DELETE/TRUNCATE 会被闸门拒绝。",
  "与 RAG 向量库（documents 表）相互独立：清空或重灌 RAG 不影响 Text2SQL 样例表。",
] as const;

export const TEXT2SQL_DEMO_EXAMPLES: readonly string[] = [
  "统计 agent_info 表里有多少条数据",
  "agent_info 里男性有几人？其中固定佣金模式的有几个？",
  "按日期统计 crs_orders 最近 7 天的订单数量",
  "heros 表里定位包含「坦克」的英雄有哪些？",
] as const;
