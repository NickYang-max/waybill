import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

interface SmartQueryAgentProps {
  onQueryResult?: (data: any) => void;
}

const EXAMPLE_QUERIES = [
  '查询2024年10月从山西到河北的煤炭运输量',
  '展示上海港周边50公里内的物流企业分布',
  '对比G15沈海高速和G2京沪高速的货车流量',
  '分析北京到天津的钢铁运输成本',
  '查询广东省水泥运输的主要流向',
];

export function SmartQueryAgent({ onQueryResult }: SmartQueryAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: '您好！我是智数物流AI助手。我可以帮您查询虚拟运单数据、分析物流趋势、提供选址建议等。请告诉我您的需求？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowExamples(false);

    // 模拟AI处理
    setTimeout(() => {
      const botResponse = generateResponse(input);
      setMessages((prev) => [...prev, botResponse]);
      if (botResponse.data && onQueryResult) {
        onQueryResult(botResponse.data);
      }
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('山西') && lowerQuery.includes('河北') && lowerQuery.includes('煤炭')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `根据虚拟运单数据分析，2024年10月从山西省到河北省的煤炭运输情况如下：\n\n📊 **运输概况**\n- 总运单数：12,847单\n- 总运输量：512,340吨\n- 平均运距：287公里\n- 主要车型：重型半挂牵引车（占78%）\n\n🚛 **热门线路**\n1. 太原→石家庄：3,245单\n2. 大同→保定：2,891单\n3. 晋城→邯郸：2,156单\n\n💰 **成本分析**\n- 平均运输成本：142元/吨\n- 高速费占比：35%\n- 油费占比：52%`,
        timestamp: new Date(),
        data: {
          type: 'transport_analysis',
          from: '山西',
          to: '河北',
          goods: '煤炭',
          totalOrders: 12847,
          totalWeight: 512340,
        },
      };
    }

    if (lowerQuery.includes('上海港') || lowerQuery.includes('周边')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `上海港周边50公里范围内物流企业分布分析：\n\n🏢 **企业统计**\n- 总企业数：2,847家\n- 物流企业：1,523家\n- 生产制造企业：1,324家\n\n📍 **区域分布**\n- 浦东新区：892家（31%）\n- 宝山区：756家（27%）\n- 嘉定区：634家（22%）\n- 其他区域：565家（20%）\n\n🚚 **车辆活跃度**\n- 日均活跃车辆：15,230辆\n- 月运输量：约420万吨\n- 主要货类：集装箱、机械设备、化工品`,
        timestamp: new Date(),
        data: {
          type: 'enterprise_distribution',
          center: '上海港',
          radius: 50,
          totalEnterprises: 2847,
        },
      };
    }

    if (lowerQuery.includes('对比') && lowerQuery.includes('高速')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `G15沈海高速 vs G2京沪高速 货车流量对比分析：\n\n📈 **流量对比（2024年10月）**\n\n| 指标 | G15沈海高速 | G2京沪高速 |\n|------|-------------|------------|\n| 日均车流量 | 28,450辆 | 32,180辆 |\n| 重卡占比 | 62% | 58% |\n| 平均车速 | 78km/h | 72km/h |\n| 空驶率 | 23% | 19% |\n\n🎯 **高峰时段**\n- G15沈海：10:00-12:00, 14:00-16:00\n- G2京沪：09:00-11:00, 15:00-17:00\n\n📦 **主要货类**\n- G15沈海：集装箱(35%)、机械设备(22%)、化工品(18%)\n- G2京沪：汽车零部件(28%)、电子产品(25%)、快消品(20%)`,
        timestamp: new Date(),
        data: {
          type: 'highway_comparison',
          highways: ['G15沈海高速', 'G2京沪高速'],
        },
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `我已收到您的查询："${query}"\n\n正在为您分析相关数据...\n\n💡 **查询结果**\n- 匹配到相关运单数据：5,230条\n- 数据时间范围：2024年1月-10月\n- 涉及车辆：3,156辆\n\n您可以进一步指定：\n1. 具体的时间范围\n2. 特定的货类或车型\n3. 起止地点\n\n或者点击左侧"数据可视化"查看地图展示。`,
      timestamp: new Date(),
      data: {
        type: 'general_query',
        query,
        matchedRecords: 5230,
      },
    };
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: '您好！我是智数物流AI助手。我可以帮您查询虚拟运单数据、分析物流趋势、提供选址建议等。请告诉我您的需求？',
        timestamp: new Date(),
      },
    ]);
    setShowExamples(true);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">智能问数Agent</CardTitle>
                <p className="text-sm text-slate-400">基于自然语言的数据查询助手</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                在线
              </Badge>
              <Button variant="ghost" size="icon" onClick={clearHistory} className="text-slate-400 hover:text-white">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-br from-violet-500 to-purple-600'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
                    <span className="text-xs opacity-50 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    <span className="text-slate-400 text-sm">AI正在分析数据...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {showExamples && (
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400">您可以这样问：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入您的问题，例如：查询从北京到上海的钢材运输量..."
                className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
