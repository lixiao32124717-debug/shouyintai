import { GoogleGenAI } from "@google/genai";
import { Transaction, Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBusinessInsight = async (transactions: Transaction[], products: Product[]) => {
  try {
    // Filter for today's transactions to keep context small and relevant
    const today = new Date().setHours(0, 0, 0, 0);
    const recentSales = transactions.filter(t => t.timestamp >= today);

    // Summarize data to reduce token count
    const summaryData = {
      date: new Date().toLocaleDateString('zh-CN'),
      totalSales: recentSales.reduce((acc, curr) => acc + curr.totalAmount, 0),
      totalProfit: recentSales.reduce((acc, curr) => acc + curr.totalProfit, 0),
      transactionCount: recentSales.length,
      topSellingItems: getTopSellingItems(recentSales),
      inventoryCount: products.length
    };

    const prompt = `
      你是一位专业的零售商业分析师。请分析以下小微企业的每日销售摘要数据。
      
      数据:
      \`\`\`json
      ${JSON.stringify(summaryData, null, 2)}
      \`\`\`

      请提供一份简明的每日报告（150字以内），包含：
      1. 快速业绩评估（优秀、一般、需改进）。
      2. 关于利润率或热销商品的关键观察。
      3. 一条提高明天销量或利润的可行建议。

      请保持专业且令人鼓舞的语气，使用中文回答。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "暂时无法生成 AI 见解。请检查您的网络连接或稍后再试。";
  }
};

// Helper to summarize top items locally before sending to AI
const getTopSellingItems = (transactions: Transaction[]) => {
  const itemCounts: Record<string, number> = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  return Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
};