import { useState, useEffect, useRef } from 'react';
import { Building2, TrendingUp, MapPin, ArrowRight, Factory, Truck, Package, Search, X, Loader2, Fuel, Lightbulb, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import * as echarts from 'echarts';

// 【实现需求：虚拟企业数据，包含上下游运输量、趟次数、月度数据和趋势分析】
interface Enterprise {
  id: string;
  name: string;
  upstreamVolume: number;
  downstreamVolume: number;
  upstreamTrips: number;
  downstreamTrips: number;
  upstreamPartners: { name: string; volume: number; trips: number }[];
  downstreamPartners: { name: string; volume: number; trips: number }[];
  monthlyData: {
    months: string[];
    upstreamTrips: number[];
    downstreamTrips: number[];
  };
  trendAnalysis: string[];
}

const MOCK_ENTERPRISES: Enterprise[] = [
  {
    id: '1',
    name: '宁武集团德盛煤业',
    upstreamVolume: 12500,
    downstreamVolume: 28600,
    upstreamTrips: 312,
    downstreamTrips: 715,
    upstreamPartners: [
      { name: '山西煤炭运销集团', volume: 5200, trips: 130 },
      { name: '大同煤矿集团', volume: 4500, trips: 112 },
      { name: '阳泉煤业集团', volume: 2800, trips: 70 },
    ],
    downstreamPartners: [
      { name: '昌盛煤气化公司', volume: 8600, trips: 215 },
      { name: '河北钢铁集团', volume: 7200, trips: 180 },
      { name: '天津港煤炭码头', volume: 6800, trips: 170 },
      { name: '山东魏桥创业集团', volume: 6000, trips: 150 },
    ],
    monthlyData: {
      months: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'],
      upstreamTrips: [18, 22, 28, 32, 35, 28, 25, 22, 30, 38, 20, 14],
      downstreamTrips: [45, 52, 68, 75, 82, 70, 65, 58, 72, 88, 48, 32],
    },
    trendAnalysis: [
      '冬季供暖季（11月-次年2月）下游趟次显著上升，与北方采暖需求高度相关',
      '夏季（6-8月）运输量相对平稳，主要受工业用电需求支撑',
      '春节前后（1-2月）运输量明显下降，受假期停工影响',
      '整体呈现明显的季节性波动特征，与煤炭行业周期性一致',
    ],
  },
  {
    id: '2',
    name: '青岛中集冷藏箱制造',
    upstreamVolume: 8600,
    downstreamVolume: 15200,
    upstreamTrips: 215,
    downstreamTrips: 380,
    upstreamPartners: [
      { name: '宝钢集团', volume: 3200, trips: 80 },
      { name: '河北钢铁集团', volume: 2800, trips: 70 },
      { name: '青岛普朗德电气', volume: 2600, trips: 65 },
    ],
    downstreamPartners: [
      { name: '海尔集团', volume: 4200, trips: 105 },
      { name: '美的集团', volume: 3800, trips: 95 },
      { name: '青岛港物流', volume: 3600, trips: 90 },
      { name: '顺丰冷链', volume: 3600, trips: 90 },
    ],
    monthlyData: {
      months: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'],
      upstreamTrips: [12, 15, 18, 20, 22, 20, 18, 16, 14, 12, 10, 8],
      downstreamTrips: [28, 32, 38, 42, 45, 40, 35, 30, 26, 22, 18, 14],
    },
    trendAnalysis: [
      '上半年（3-7月）运输量持续攀升，与出口订单季节性增长相关',
      '下半年（8-12月）逐步回落，受海外需求放缓影响',
      '春节前后（1-2月）处于全年低谷，生产线停工检修',
      '整体趋势与家电出口周期高度吻合',
    ],
  },
  {
    id: '3',
    name: '广东中烟工业湛江卷烟厂',
    upstreamVolume: 6200,
    downstreamVolume: 9800,
    upstreamTrips: 155,
    downstreamTrips: 245,
    upstreamPartners: [
      { name: '益锋粮油', volume: 2800, trips: 70 },
      { name: '云南烟草集团', volume: 2200, trips: 55 },
      { name: '贵州中烟', volume: 1200, trips: 30 },
    ],
    downstreamPartners: [
      { name: '广东省烟草公司', volume: 4200, trips: 105 },
      { name: '深圳市烟草公司', volume: 2800, trips: 70 },
      { name: '广州市烟草公司', volume: 2800, trips: 70 },
    ],
    monthlyData: {
      months: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'],
      upstreamTrips: [10, 12, 13, 14, 13, 12, 14, 15, 16, 18, 12, 6],
      downstreamTrips: [18, 20, 22, 24, 22, 20, 23, 25, 28, 32, 20, 11],
    },
    trendAnalysis: [
      '春节前（12月-1月）运输量达到峰值，与节日备货需求相关',
      '春节后（2月）急剧下降，市场需求进入短暂调整期',
      '全年运输相对平稳，波动幅度较小，体现烟草行业稳定性',
      '下半年整体略高于上半年，与中秋国庆双节备货有关',
    ],
  },
  {
    id: '4',
    name: '惠州市新骏宏鞋业',
    upstreamVolume: 3200,
    downstreamVolume: 5800,
    upstreamTrips: 80,
    downstreamTrips: 145,
    upstreamPartners: [
      { name: '福建皮革厂', volume: 1200, trips: 30 },
      { name: '浙江纺织集团', volume: 1000, trips: 25 },
      { name: '广东橡胶厂', volume: 1000, trips: 25 },
    ],
    downstreamPartners: [
      { name: '佳联迅物流仓库', volume: 2200, trips: 55 },
      { name: '深圳华强北批发商', volume: 1800, trips: 45 },
      { name: '广州鞋城', volume: 1800, trips: 45 },
    ],
    monthlyData: {
      months: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'],
      upstreamTrips: [5, 6, 7, 8, 7, 6, 7, 8, 9, 10, 4, 3],
      downstreamTrips: [10, 12, 14, 16, 14, 12, 14, 16, 18, 20, 8, 5],
    },
    trendAnalysis: [
      '下半年（9-12月）运输量明显高于上半年，与秋冬鞋类旺季相关',
      '夏季（6-8月）相对平稳，凉鞋需求与原材料供应形成平衡',
      '春节前后（1-2月）大幅下降，工厂放假及物流停运影响显著',
      '整体呈现明显的淡旺季交替特征',
    ],
  },
  {
    id: '5',
    name: '河北钢铁集团唐山分公司',
    upstreamVolume: 28600,
    downstreamVolume: 32400,
    upstreamTrips: 572,
    downstreamTrips: 648,
    upstreamPartners: [
      { name: '澳大利亚铁矿石', volume: 12000, trips: 240 },
      { name: '巴西淡水河谷', volume: 8600, trips: 172 },
      { name: '山西焦炭集团', volume: 8000, trips: 160 },
    ],
    downstreamPartners: [
      { name: '中国建筑集团', volume: 12000, trips: 240 },
      { name: '上海汽车集团', volume: 8600, trips: 172 },
      { name: '美的集团', volume: 6800, trips: 136 },
      { name: '格力电器', volume: 5000, trips: 100 },
    ],
    monthlyData: {
      months: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'],
      upstreamTrips: [38, 42, 48, 52, 55, 50, 48, 45, 52, 58, 42, 32],
      downstreamTrips: [42, 48, 55, 60, 65, 58, 55, 50, 58, 65, 48, 36],
    },
    trendAnalysis: [
      '春季（3-5月）运输量稳步上升，与基建开工季高度相关',
      '夏季（6-8月）维持高位，房地产和制造业需求双重支撑',
      '秋季（9-11月）再次攀升，年底工程赶工带动钢材需求',
      '冬季（12-2月）明显回落，环保限产及工地停工影响',
      '上游铁矿石进口波动与国际航运价格变化相关',
    ],
  },
];

export function SmartAnalysisAgent() {
  const [activeTab, setActiveTab] = useState('enterprise');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>(MOCK_ENTERPRISES[0].id);
  const cargoChartRef = useRef<HTMLDivElement>(null);
  const flowChartRef = useRef<HTMLDivElement>(null);
  const regionChartRef = useRef<HTMLDivElement>(null);
  const vehicleChartRef = useRef<HTMLDivElement>(null);
  const mapFlowChartRef = useRef<HTMLDivElement>(null);
  const regionInteractionChartRef = useRef<HTMLDivElement>(null);

  // 【实现需求：货物流向分析图表初始化函数】
  const initCargoCharts = () => {
    // 货类分布图
    if (cargoChartRef.current) {
      const chart = echarts.init(cargoChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', formatter: '{b}: {c}单 ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: [
            { name: '矿物性建筑材料', value: 42, itemStyle: { color: '#3b82f6' } },
            { name: '煤炭及制品', value: 28, itemStyle: { color: '#10b981' } },
            { name: '钢铁', value: 18, itemStyle: { color: '#f59e0b' } },
            { name: '机械设备', value: 8, itemStyle: { color: '#8b5cf6' } },
            { name: '其他', value: 4, itemStyle: { color: '#6b7280' } },
          ],
          label: { color: '#94a3b8', fontSize: 11 },
          itemStyle: { borderRadius: 5, borderColor: '#0f172a', borderWidth: 2 },
        }],
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: '#94a3b8', fontSize: 10 },
        },
      });
    }

    // 货物流向图
    if (flowChartRef.current) {
      const chart = echarts.init(flowChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['山西→河北', '内蒙古→山西', '河北→天津', '山东→江苏', '河南→湖北', '广东→福建'],
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 15 },
        },
        yAxis: {
          type: 'value',
          name: '运单数',
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
        series: [{
          data: [156, 128, 98, 87, 76, 65],
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' },
            ]),
          },
        }],
      });
    }

    // 区域分布图
    if (regionChartRef.current) {
      const chart = echarts.init(regionChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
        yAxis: {
          type: 'category',
          data: ['广东', '江苏', '山东', '河北', '河南', '山西', '浙江', '内蒙古'],
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
        },
        series: [{
          data: [32, 28, 26, 24, 18, 16, 15, 12],
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' },
            ]),
          },
        }],
      });
    }

    // 车型分布图
    if (vehicleChartRef.current) {
      const chart = echarts.init(vehicleChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
        series: [{
          type: 'pie',
          radius: ['35%', '60%'],
          center: ['50%', '50%'],
          data: [
            { name: '重型半挂牵引车', value: 68, itemStyle: { color: '#3b82f6' } },
            { name: '重型自卸货车', value: 18, itemStyle: { color: '#10b981' } },
            { name: '重型厢式货车', value: 9, itemStyle: { color: '#f59e0b' } },
            { name: '重型仓栅式货车', value: 5, itemStyle: { color: '#8b5cf6' } },
          ],
          label: { color: '#94a3b8', fontSize: 10 },
          itemStyle: { borderRadius: 4, borderColor: '#0f172a', borderWidth: 2 },
        }],
        legend: {
          orient: 'vertical',
          right: 5,
          top: 'center',
          textStyle: { color: '#94a3b8', fontSize: 9 },
        },
      });
    }

    // 【实现需求：主要物流流向桑基图 - 不依赖地图数据】
    if (mapFlowChartRef.current) {
      const chart = echarts.init(mapFlowChartRef.current);

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', triggerOn: 'mousemove' },
        series: [{
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          data: [
            { name: '山西', itemStyle: { color: '#3b82f6' } },
            { name: '内蒙古', itemStyle: { color: '#10b981' } },
            { name: '河北', itemStyle: { color: '#f59e0b' } },
            { name: '山东', itemStyle: { color: '#8b5cf6' } },
            { name: '河南', itemStyle: { color: '#ec4899' } },
            { name: '上海', itemStyle: { color: '#06b6d4' } },
            { name: '广东', itemStyle: { color: '#f97316' } },
            { name: '陕西', itemStyle: { color: '#84cc16' } },
            { name: '辽宁', itemStyle: { color: '#6366f1' } },
            { name: '天津', itemStyle: { color: '#14b8a6' } },
            { name: '石家庄', itemStyle: { color: '#a855f7' } },
            { name: '青岛', itemStyle: { color: '#22c55e' } },
            { name: '武汉', itemStyle: { color: '#eab308' } },
            { name: '南京', itemStyle: { color: '#3b82f6' } },
            { name: '深圳', itemStyle: { color: '#10b981' } },
            { name: '成都', itemStyle: { color: '#f59e0b' } },
            { name: '大连', itemStyle: { color: '#8b5cf6' } },
          ],
          links: [
            { source: '山西', target: '石家庄', value: 156 },
            { source: '山西', target: '天津', value: 98 },
            { source: '内蒙古', target: '山西', value: 128 },
            { source: '河北', target: '天津', value: 87 },
            { source: '山东', target: '青岛', value: 76 },
            { source: '河南', target: '武汉', value: 65 },
            { source: '上海', target: '南京', value: 112 },
            { source: '广东', target: '深圳', value: 89 },
            { source: '陕西', target: '成都', value: 54 },
            { source: '辽宁', target: '大连', value: 71 },
          ],
          lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.4 },
          label: { color: '#94a3b8', fontSize: 11 },
        }],
      });
    }

    // 【实现需求：区域间相互作用关系图】
    if (regionInteractionChartRef.current) {
      const chart = echarts.init(regionInteractionChartRef.current);
      
      const regions = ['华北', '华东', '华南', '华中', '西南', '东北', '西北'];
      const interactionData = [
        [0, 0, 100], [0, 1, 35], [0, 2, 12], [0, 3, 28], [0, 4, 8], [0, 5, 22], [0, 6, 15],
        [1, 0, 32], [1, 1, 100], [1, 2, 45], [1, 3, 38], [1, 4, 25], [1, 5, 18], [1, 6, 8],
        [2, 0, 10], [2, 1, 42], [2, 2, 100], [2, 3, 35], [2, 4, 30], [2, 5, 12], [2, 6, 5],
        [3, 0, 25], [3, 1, 36], [3, 2, 32], [3, 3, 100], [3, 4, 45], [3, 5, 15], [3, 6, 18],
        [4, 0, 8], [4, 1, 22], [4, 2, 28], [4, 3, 42], [4, 4, 100], [4, 5, 10], [4, 6, 35],
        [5, 0, 20], [5, 1, 16], [5, 2, 8], [5, 3, 12], [5, 4, 6], [5, 5, 100], [5, 6, 25],
        [6, 0, 18], [6, 1, 6], [6, 2, 4], [6, 3, 15], [6, 4, 38], [6, 5, 22], [6, 6, 100],
      ].map((item) => [item[0], item[1], item[2]]);

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          position: 'top',
          formatter: (params: any) => {
            return `${regions[params.data[0]]} → ${regions[params.data[1]]}<br/>物流强度指数: ${params.data[2]}`;
          },
        },
        grid: { top: '10%', bottom: '15%', left: '15%', right: '5%' },
        xAxis: {
          type: 'category',
          data: regions,
          splitArea: { show: true, areaStyle: { color: ['#1e293b', '#0f172a'] } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
          axisLine: { lineStyle: { color: '#475569' } },
        },
        yAxis: {
          type: 'category',
          data: regions,
          splitArea: { show: true, areaStyle: { color: ['#1e293b', '#0f172a'] } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
          axisLine: { lineStyle: { color: '#475569' } },
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '2%',
          textStyle: { color: '#94a3b8' },
          inRange: {
            color: ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          },
        },
        series: [{
          name: '区域物流强度',
          type: 'heatmap',
          data: interactionData,
          label: {
            show: true,
            color: '#fff',
            fontSize: 9,
            formatter: (params: any) => params.data[2],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }],
      });
    }
  };

  // 【实现需求：货物流向分析图表初始化 - 在切换到cargo标签页时执行】
  useEffect(() => {
    if (activeTab !== 'cargo') return;

    // 使用 setTimeout 确保 DOM 已经渲染
    const timer = setTimeout(() => {
      initCargoCharts();
    }, 200);

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="enterprise" className="data-[state=active]:bg-blue-600">
              <Building2 className="w-4 h-4 mr-1" />
              企业上下游分析
            </TabsTrigger>
            <TabsTrigger value="cargo" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              货物流向分析
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-blue-600">
              <MapPin className="w-4 h-4 mr-1" />
              智能选址分析
            </TabsTrigger>
          </TabsList>
          <Badge variant="outline" className="border-violet-500 text-violet-400">
            基于真实运单数据分析
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          {/* 企业上下游分析 */}
          <TabsContent value="enterprise" className="mt-0 space-y-4">
            {/* 【实现需求：在最顶部增加选择针对一个企业】 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  选择企业
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedEnterpriseId} onValueChange={setSelectedEnterpriseId}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="请选择企业" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {MOCK_ENTERPRISES.map((enterprise) => (
                      <SelectItem
                        key={enterprise.id}
                        value={enterprise.id}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {enterprise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 【实现需求：展示选中企业的上游运输量和下游运输量】 */}
            {(() => {
              const selectedEnterprise = MOCK_ENTERPRISES.find((e) => e.id === selectedEnterpriseId);
              if (!selectedEnterprise) return null;
              return (
                <>
                  {/* 【实现需求：展示选中企业的上游运输量和下游运输量，趟次数放大显示，吨数缩小显示】 */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-400 rotate-180" />
                          上游运输
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-400">
                          {selectedEnterprise.upstreamTrips.toLocaleString()}
                          <span className="text-sm text-slate-400 ml-2">趟</span>
                        </div>
                        <div className="text-sm text-slate-300 mt-2">
                          <span className="text-blue-400 font-semibold">{selectedEnterprise.upstreamVolume.toLocaleString()}</span>
                          <span className="text-slate-400 ml-1">吨</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          来自 {selectedEnterprise.upstreamPartners.length} 家上游企业
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-400" />
                          下游运输
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-400">
                          {selectedEnterprise.downstreamTrips.toLocaleString()}
                          <span className="text-sm text-slate-400 ml-2">趟</span>
                        </div>
                        <div className="text-sm text-slate-300 mt-2">
                          <span className="text-green-400 font-semibold">{selectedEnterprise.downstreamVolume.toLocaleString()}</span>
                          <span className="text-slate-400 ml-1">吨</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          流向 {selectedEnterprise.downstreamPartners.length} 家下游企业
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 【实现需求：上游合作伙伴和下游合作伙伴左右并列】 */}
                  {/* 【实现需求：上游合作伙伴和下游合作伙伴左右并列，趟次数优先显示】 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 上游合作伙伴 */}
                    <Card className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Factory className="w-4 h-4 text-blue-400" />
                          上游合作伙伴
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedEnterprise.upstreamPartners.map((partner, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-800 rounded"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-blue-400 font-semibold w-6">{index + 1}</span>
                                <span className="text-slate-300">{partner.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-semibold">
                                  {partner.trips.toLocaleString()} 趟
                                </span>
                                <span className="text-xs text-slate-400 ml-2">
                                  {partner.volume.toLocaleString()} 吨
                                </span>
                                <span className="text-xs text-slate-500 ml-2">
                                  {((partner.trips / selectedEnterprise.upstreamTrips) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 下游合作伙伴 */}
                    <Card className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-green-400" />
                          下游合作伙伴
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedEnterprise.downstreamPartners.map((partner, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-800 rounded"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-green-400 font-semibold w-6">{index + 1}</span>
                                <span className="text-slate-300">{partner.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-semibold">
                                  {partner.trips.toLocaleString()} 趟
                                </span>
                                <span className="text-xs text-slate-400 ml-2">
                                  {partner.volume.toLocaleString()} 吨
                                </span>
                                <span className="text-xs text-slate-500 ml-2">
                                  {((partner.trips / selectedEnterprise.downstreamTrips) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 【实现需求：近12个月上游下游趟次数折线图】 */}
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        近12个月运输趟次趋势
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnterpriseTrendChart enterprise={selectedEnterprise} />
                    </CardContent>
                  </Card>

                  {/* 【实现需求：供应链趋势分析，只分析不给出建议】 */}
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                        运输趋势分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedEnterprise.trendAnalysis.map((analysis, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{analysis}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>

          {/* 货物流向分析 */}
          <TabsContent value="cargo" className="mt-0 space-y-4">
            {/* 【实现需求：地图流向可视化展示】 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  全国主要物流流向图
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={mapFlowChartRef} className="h-[400px]" />
                <div className="mt-3 text-xs text-slate-400">
                  <p>图示说明：线条表示主要货物流向，线条粗细代表运单量大小，城市节点大小反映该城市的物流活跃度</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {/* 货类分布 */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    货类分布占比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={cargoChartRef} className="h-[200px]" />
                </CardContent>
              </Card>

              {/* 主要流向 */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    主要货物流向TOP6
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={flowChartRef} className="h-[200px]" />
                </CardContent>
              </Card>
            </div>

            {/* 区域运量分布 */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    各省份运量分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={regionChartRef} className="h-[200px]" />
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-yellow-400" />
                    运输车型分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={vehicleChartRef} className="h-[200px]" />
                </CardContent>
              </Card>
            </div>

            {/* 【实现需求：区域间相互作用热力图】 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  区域间物流相互作用强度矩阵
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={regionInteractionChartRef} className="h-[350px]" />
                <div className="mt-3 text-xs text-slate-400">
                  <p>图示说明：颜色越深表示区域间物流交互越频繁，数值为物流强度指数（0-100）</p>
                </div>
              </CardContent>
            </Card>

            {/* 流向详细数据 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">主要流向详细数据</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-blue-400 text-sm font-semibold mb-2">山西→河北</div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between"><span>运单数:</span><span className="text-white">156单</span></div>
                      <div className="flex justify-between"><span>主要货类:</span><span className="text-white">煤炭、焦炭</span></div>
                      <div className="flex justify-between"><span>平均运距:</span><span className="text-white">287km</span></div>
                      <div className="flex justify-between"><span>平均载重:</span><span className="text-white">38.5吨</span></div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-green-400 text-sm font-semibold mb-2">内蒙古→山西</div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between"><span>运单数:</span><span className="text-white">128单</span></div>
                      <div className="flex justify-between"><span>主要货类:</span><span className="text-white">煤炭、铁矿石</span></div>
                      <div className="flex justify-between"><span>平均运距:</span><span className="text-white">412km</span></div>
                      <div className="flex justify-between"><span>平均载重:</span><span className="text-white">39.2吨</span></div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-yellow-400 text-sm font-semibold mb-2">河北→天津</div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between"><span>运单数:</span><span className="text-white">98单</span></div>
                      <div className="flex justify-between"><span>主要货类:</span><span className="text-white">钢材、建材</span></div>
                      <div className="flex justify-between"><span>平均运距:</span><span className="text-white">156km</span></div>
                      <div className="flex justify-between"><span>平均载重:</span><span className="text-white">37.8吨</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 【实现需求：详细的货物流向分析报告 - 图文并茂】 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  货物流向深度分析报告
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 第一部分：整体流向特征 */}
                <div className="space-y-3">
                  <h3 className="text-blue-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-400 rounded"></span>
                    一、整体货物流向特征分析
                  </h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-xs font-bold">01</span>
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium mb-1">资源型货物呈现"西煤东运、北煤南运"格局</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          从流向图可以清晰看出，山西、内蒙古作为煤炭主产区，向河北、天津等工业集中地输出。其中山西→河北线路运单量达156单，占总运量的12.8%，
                          主要运输煤炭、焦炭等能源类货物。这一流向特征与我国能源资源分布和工业布局高度吻合。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 text-xs font-bold">02</span>
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium mb-1">沿海港口成为物流集散中心</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          天津、青岛、上海、大连等港口城市在流向图中呈现高活跃度（节点较大）。这些城市既是进口铁矿石的接卸港，
                          也是出口钢材、机械设备等工业品的出海口，形成了"海铁联运"的物流模式。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-400 text-xs font-bold">03</span>
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium mb-1">区域经济一体化促进短途物流繁荣</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          上海→南京（112单）、广州→深圳（89单）等短途线路运量可观，反映了长三角、珠三角区域经济一体化程度高，
                          产业链分工明确，零部件、产成品在区域内频繁流转。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 第二部分：区域间相互作用 */}
                <div className="space-y-3">
                  <h3 className="text-green-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-400 rounded"></span>
                    二、区域间物流相互作用分析
                  </h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-800 rounded">
                        <p className="text-blue-400 text-xs font-semibold mb-2">华北 ↔ 华东：能源与制成品对流</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          物流强度指数35，华北地区向华东输出煤炭、钢铁等原材料，华东向华北输入机械设备、电子产品等制成品，
                          形成了典型的"原材料-制成品"对流模式。
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded">
                        <p className="text-green-400 text-xs font-semibold mb-2">华东 ↔ 华南：制造业产业链协同</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          物流强度指数45，两地制造业发达，电子元器件、汽车零部件在两地间频繁运输，
                          反映了长三角与珠三角制造业的深度协作关系。
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded">
                        <p className="text-yellow-400 text-xs font-semibold mb-2">华中 ↔ 西南：资源互补型运输</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          物流强度指数42，华中地区向西南输出机械设备、建材，西南向华中输出农产品、矿产，
                          体现了区域资源禀赋差异带来的物流需求。
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded">
                        <p className="text-purple-400 text-xs font-semibold mb-2">西北 ↔ 西南：能源通道</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          物流强度指数38，西北地区（新疆、甘肃）向西南地区输送天然气、煤炭等能源物资，
                          是国家"西气东输"、"西电东送"战略的物流体现。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 第三部分：货类与流向关联 */}
                <div className="space-y-3">
                  <h3 className="text-yellow-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-1 h-4 bg-yellow-400 rounded"></span>
                    三、货类特征与流向关联性分析
                  </h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-slate-200 text-sm font-medium">矿物性建筑材料（占比42%）</p>
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">
                          主要流向为济南→青岛、石家庄→天津等短途线路，平均运距156km。这类货物价值低、重量大，
                          运输成本高，因此呈现明显的"就近取材、就近供应"特征，流向与基建项目分布高度相关。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-slate-200 text-sm font-medium">煤炭及制品（占比28%）</p>
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">
                          主要流向为山西→河北、内蒙古→山西、大同→天津等长途线路，平均运距328km。
                          煤炭运输呈现"点对点"大宗运输特征，运距长、批量大，对铁路和重载公路依赖度高。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-slate-200 text-sm font-medium">钢铁（占比18%）</p>
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">
                          主要流向为沈阳→大连、石家庄→天津等线路，平均运距198km。钢铁运输与下游制造业分布密切相关，
                          流向目的地多为汽车制造、机械加工产业聚集区。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 第四部分：综合结论 */}
                <div className="space-y-3">
                  <h3 className="text-purple-400 font-semibold text-sm flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-400 rounded"></span>
                    四、综合分析结论
                  </h3>
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-800/30">
                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">▸</span>
                        <span>
                          <strong className="text-white">资源分布决定基础流向：</strong>
                          我国能源资源"西多东少、北多南少"的分布特征，决定了煤炭、矿石等大宗货物从西向东、从北向南的基本流向。
                          这一格局在短期内难以改变，相关物流通道将持续保持高负荷运转。
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">▸</span>
                        <span>
                          <strong className="text-white">产业集聚催生区域内部物流：</strong>
                          长三角、珠三角、京津冀等经济圈内部物流活跃，产业链上下游企业空间集聚，
                          形成了高频次、小批量的零部件运输需求，与大宗货物的低频次、大批量形成鲜明对比。
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">▸</span>
                        <span>
                          <strong className="text-white">港口枢纽地位突出：</strong>
                          天津、青岛、上海、大连等港口城市是全国物流网络的关键节点，
                          承担着"国际-国内"物流转换功能，未来应继续加强港口集疏运体系建设。
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">▸</span>
                        <span>
                          <strong className="text-white">区域协调发展带来新机遇：</strong>
                          随着西部大开发、中部崛起等战略推进，华中-西南、西北-西南等区域的物流强度持续提升，
                          预示着内陆地区经济活力增强，物流网络正在从"沿海单极"向"多极网络化"演变。
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 智能选址分析 */}
          <TabsContent value="location" className="mt-0 space-y-4">
            {/* 【实现需求：选址建站智能搜索框】 */}
            <LocationSearchBox />

            {/* 【实现需求：不同道路流量分析图表】 */}
            <RoadTrafficAnalysis />

            <div className="grid grid-cols-3 gap-4">
              {/* 高流量区域 */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    高流量区域TOP5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { area: '唐山-曹妃甸港区', flow: '日均车流量 2,850辆', cargo: '铁矿石、钢材' },
                      { area: '天津-滨海新区', flow: '日均车流量 2,420辆', cargo: '集装箱、钢材' },
                      { area: '青岛-黄岛港区', flow: '日均车流量 2,180辆', cargo: '集装箱、机械设备' },
                      { area: '上海-洋山港区', flow: '日均车流量 1,960辆', cargo: '集装箱、汽车' },
                      { area: '宁波-舟山港区', flow: '日均车流量 1,840辆', cargo: '集装箱、矿石' },
                    ].map((item, index) => (
                      <div key={index} className="p-2 bg-slate-800 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-semibold">{index + 1}</span>
                          <span className="text-slate-300 text-sm">{item.area}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{item.flow} | {item.cargo}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 货源密集区 */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Factory className="w-4 h-4 text-green-400" />
                    货源密集区域TOP5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { area: '河北唐山市', count: '水泥/钢铁企业 286家', monthly: '月运量 12.8万吨' },
                      { area: '山西吕梁市', count: '煤炭企业 158家', monthly: '月运量 15.2万吨' },
                      { area: '内蒙古鄂尔多斯', count: '煤炭企业 142家', monthly: '月运量 18.6万吨' },
                      { area: '山东潍坊市', count: '建材企业 198家', monthly: '月运量 9.4万吨' },
                      { area: '河南郑州市', count: '制造企业 245家', monthly: '月运量 8.7万吨' },
                    ].map((item, index) => (
                      <div key={index} className="p-2 bg-slate-800 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-semibold">{index + 1}</span>
                          <span className="text-slate-300 text-sm">{item.area}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{item.count} | {item.monthly}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 选址建议 */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-400" />
                    选址建议TOP5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800 rounded">
                      <div className="text-blue-400 text-sm font-semibold mb-1">1. 充换电站选址</div>
                      <div className="text-xs text-slate-400">
                        建议区域：唐山曹妃甸港区周边5km<br/>
                        理由：日均车流量2850辆，重卡占比82%，新能源替代需求大
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800 rounded">
                      <div className="text-green-400 text-sm font-semibold mb-1">2. 物流园区选址</div>
                      <div className="text-xs text-slate-400">
                        建议区域：山西吕梁-河北石家庄之间<br/>
                        理由：煤炭运输主干道，日均车流量超1500辆
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800 rounded">
                      <div className="text-yellow-400 text-sm font-semibold mb-1">3. 仓储中心选址</div>
                      <div className="text-xs text-slate-400">
                        建议区域：天津滨海新区<br/>
                        理由：港口+工业双重需求，货类多样化
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 选址关键因素 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">选址关键因素分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">2,850</div>
                    <div className="text-xs text-slate-400 mt-1">日均车流量(辆)</div>
                    <div className="text-xs text-slate-500 mt-1">唐山曹妃甸港区</div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">286</div>
                    <div className="text-xs text-slate-400 mt-1">周边企业数(家)</div>
                    <div className="text-xs text-slate-500 mt-1">河北唐山市</div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-400">18.6万</div>
                    <div className="text-xs text-slate-400 mt-1">月运输量(吨)</div>
                    <div className="text-xs text-slate-500 mt-1">内蒙古鄂尔多斯</div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">82%</div>
                    <div className="text-xs text-slate-400 mt-1">重卡占比</div>
                    <div className="text-xs text-slate-500 mt-1">港口区域平均</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据结论 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">分析结论</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• <span className="text-blue-400">港口区域车流量最大</span>：唐山曹妃甸、天津滨海等港口区域日均车流量超2000辆，是充换电站的理想选址</p>
                  <p>• <span className="text-green-400">产业集聚区货源稳定</span>：河北唐山（水泥/钢铁）、山西吕梁（煤炭）等产业聚集地，月运量超10万吨</p>
                  <p>• <span className="text-yellow-400">运输通道价值高</span>：山西→河北、内蒙古→山西等煤炭运输通道，车流量大且稳定</p>
                  <p>• <span className="text-purple-400">重卡占比决定需求</span>：港口和矿区周边重卡占比超80%，是新能源重卡推广的重点区域</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// 【实现需求：企业运输趟次趋势折线图组件】
// 【输入：Enterprise | 输出：ECharts折线图 | 约束：展示近12个月上下游趟次数变化】
function EnterpriseTrendChart({ enterprise }: { enterprise: Enterprise }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
        },
        legend: {
          data: ['上游趟次', '下游趟次'],
          textStyle: { color: '#94a3b8' },
          top: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: enterprise.monthlyData.months,
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 },
        },
        yAxis: {
          type: 'value',
          name: '趟次',
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
        series: [
          {
            name: '上游趟次',
            type: 'line',
            data: enterprise.monthlyData.upstreamTrips,
            smooth: true,
            itemStyle: { color: '#3b82f6' },
            lineStyle: { width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ]),
            },
          },
          {
            name: '下游趟次',
            type: 'line',
            data: enterprise.monthlyData.downstreamTrips,
            smooth: true,
            itemStyle: { color: '#10b981' },
            lineStyle: { width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
              ]),
            },
          },
        ],
      });

      return () => {
        chart.dispose();
      };
    }
  }, [enterprise]);

  return <div ref={chartRef} className="h-[250px]" />;
}

// 【实现需求：选址建站智能搜索框组件】
// 【输入：用户输入的选址问题 | 输出：搜索结果展示 | 约束：支持灵活的自然语言查询】
function LocationSearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{
    location: string;
    traffic: string;
    stations: string;
    suggestion: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const exampleQuestions = [
    'G15沈海高速上海段车流量如何？适合建站吗？',
    '北京五环周边有多少加油站？充电站分布如何？',
    '山西省道S307沿线货车流量和空载率是多少？',
    '天津港周边5公里内加油站密集程度如何？',
    '沪昆高速江西段服务区充电桩数量及使用情况？',
    '河北唐山国道G205沿线煤炭运输车辆多吗？',
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    // 模拟AI分析
    setTimeout(() => {
      // 根据查询内容生成模拟结果
      const mockResults: Record<string, { location: string; traffic: string; stations: string; suggestion: string }> = {
        'G15': {
          location: 'G15沈海高速上海段',
          traffic: '日均车流量 3,200辆，其中重卡占比 68%，空载率 23%，满载率 77%',
          stations: '沿线现有加油站 12座，充电站 3座，平均间距 45km',
          suggestion: '该路段车流量大、重卡占比高，建议建设大型综合能源补给站，配置快充桩8-10个',
        },
        '北京': {
          location: '北京五环周边',
          traffic: '日均车流量 4,500辆，重卡占比 45%，以轻卡和城市配送为主',
          stations: '现有加油站 28座，充电站 15座，分布较密集',
          suggestion: '充电站分布已较完善，建议在五环外物流园区增设换电站，服务城市配送车辆',
        },
        '山西': {
          location: '山西省道S307',
          traffic: '日均车流量 1,800辆，重卡占比 82%，煤炭运输为主，空载率 35%',
          stations: '沿线加油站 8座，充电站 0座，服务设施不足',
          suggestion: '煤炭运输通道，重卡密集且新能源设施空白，建议优先建设重卡换电站',
        },
        '天津港': {
          location: '天津港周边5公里',
          traffic: '日均车流量 2,850辆，重卡占比 82%，集装箱运输为主',
          stations: '加油站 6座，充电站 2座，换电站 0座',
          suggestion: '港口物流核心区，新能源重卡需求迫切，建议建设港口专用换电站',
        },
        '沪昆': {
          location: '沪昆高速江西段',
          traffic: '日均车流量 2,100辆，重卡占比 58%，跨省物流通道',
          stations: '服务区 8个，充电桩 24个，平均每个服务区3个',
          suggestion: '充电桩覆盖尚可但功率偏低，建议升级为大功率快充并增加重卡换电设施',
        },
        '唐山': {
          location: '河北唐山国道G205',
          traffic: '日均车流量 2,200辆，重卡占比 75%，钢铁煤炭运输为主',
          stations: '加油站 15座，充电站 2座，换电站 1座',
          suggestion: '工业运输主干道，建议增设重卡换电站并配套停车场、维修服务',
        },
      };

      // 匹配关键词
      const matchedKey = Object.keys(mockResults).find(key => searchQuery.includes(key));
      setSearchResult(matchedKey ? mockResults[matchedKey] : {
        location: searchQuery,
        traffic: '日均车流量 2,500辆，重卡占比 65%，空载率 25%',
        stations: '沿线加油站 10座，充电站 2座，平均间距 50km',
        suggestion: '该路段车流量中等，重卡占比较高，建议建设中型充电站，配置快充桩4-6个',
      });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" />
          智能选址查询
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索框 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="请输入道路名称、路段或区域，如：G15沈海高速、北京五环、山西省道S307..."
              className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isSearching ? '分析中...' : '查询'}
          </Button>
        </div>

        {/* 示例问题 */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400">您可以这样问：</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(question)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果 */}
        {searchResult && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">{searchResult.location}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-800 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">交通流量</span>
                </div>
                <p className="text-slate-300 text-sm">{searchResult.traffic}</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Fuel className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold">能源设施</span>
                </div>
                <p className="text-slate-300 text-sm">{searchResult.stations}</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-xs font-semibold">选址建议</span>
                </div>
                <p className="text-slate-300 text-sm">{searchResult.suggestion}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 【实现需求：不同道路流量分析组件】
// 【输入：道路类型数据 | 输出：图表展示 | 约束：展示高速、国道、省道的流量、空满载、能源设施分布】
function RoadTrafficAnalysis() {
  const highwayChartRef = useRef<HTMLDivElement>(null);
  const nationalRoadChartRef = useRef<HTMLDivElement>(null);
  const provincialRoadChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 高速公路流量分析
    if (highwayChartRef.current) {
      const chart = echarts.init(highwayChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        title: {
          text: '高速公路TOP5',
          left: 'center',
          textStyle: { color: '#94a3b8', fontSize: 14 },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const data = params[0].data;
            return `${params[0].name}<br/>
                    日均车次: ${data.value}辆<br/>
                    空载: ${data.empty}辆 (${data.emptyRate}%)<br/>
                    满载: ${data.full}辆 (${data.fullRate}%)<br/>
                    加油站: ${data.gasStation}座<br/>
                    充电站: ${data.chargeStation}座`;
          },
        },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['G15沈海', 'G2京沪', 'G45大广', 'G60沪昆', 'G25长深'],
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
        },
        yAxis: {
          type: 'value',
          name: '日均车次',
          nameTextStyle: { color: '#94a3b8' },
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
        series: [{
          type: 'bar',
          data: [
            { value: 3200, empty: 736, emptyRate: 23, full: 2464, fullRate: 77, gasStation: 12, chargeStation: 3 },
            { value: 2850, empty: 570, emptyRate: 20, full: 2280, fullRate: 80, gasStation: 10, chargeStation: 4 },
            { value: 2600, empty: 780, emptyRate: 30, full: 1820, fullRate: 70, gasStation: 9, chargeStation: 2 },
            { value: 2400, empty: 480, emptyRate: 20, full: 1920, fullRate: 80, gasStation: 8, chargeStation: 3 },
            { value: 2100, empty: 420, emptyRate: 20, full: 1680, fullRate: 80, gasStation: 7, chargeStation: 2 },
          ],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' },
            ]),
          },
        }],
      });
    }

    // 国道流量分析
    if (nationalRoadChartRef.current) {
      const chart = echarts.init(nationalRoadChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        title: {
          text: '国道TOP5',
          left: 'center',
          textStyle: { color: '#94a3b8', fontSize: 14 },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const data = params[0].data;
            return `${params[0].name}<br/>
                    日均车次: ${data.value}辆<br/>
                    空载: ${data.empty}辆 (${data.emptyRate}%)<br/>
                    满载: ${data.full}辆 (${data.fullRate}%)<br/>
                    加油站: ${data.gasStation}座<br/>
                    充电站: ${data.chargeStation}座`;
          },
        },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['G205', 'G107', 'G312', 'G108', 'G206'],
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
        },
        yAxis: {
          type: 'value',
          name: '日均车次',
          nameTextStyle: { color: '#94a3b8' },
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
        series: [{
          type: 'bar',
          data: [
            { value: 2200, empty: 770, emptyRate: 35, full: 1430, fullRate: 65, gasStation: 15, chargeStation: 2 },
            { value: 1950, empty: 585, emptyRate: 30, full: 1365, fullRate: 70, gasStation: 12, chargeStation: 1 },
            { value: 1800, empty: 540, emptyRate: 30, full: 1260, fullRate: 70, gasStation: 10, chargeStation: 1 },
            { value: 1650, empty: 495, emptyRate: 30, full: 1155, fullRate: 70, gasStation: 9, chargeStation: 1 },
            { value: 1500, empty: 450, emptyRate: 30, full: 1050, fullRate: 70, gasStation: 8, chargeStation: 0 },
          ],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' },
            ]),
          },
        }],
      });
    }

    // 省道流量分析
    if (provincialRoadChartRef.current) {
      const chart = echarts.init(provincialRoadChartRef.current);
      chart.setOption({
        backgroundColor: 'transparent',
        title: {
          text: '省道TOP5',
          left: 'center',
          textStyle: { color: '#94a3b8', fontSize: 14 },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const data = params[0].data;
            return `${params[0].name}<br/>
                    日均车次: ${data.value}辆<br/>
                    空载: ${data.empty}辆 (${data.emptyRate}%)<br/>
                    满载: ${data.full}辆 (${data.fullRate}%)<br/>
                    加油站: ${data.gasStation}座<br/>
                    充电站: ${data.chargeStation}座`;
          },
        },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['S307', 'S203', 'S101', 'S305', 'S201'],
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
        },
        yAxis: {
          type: 'value',
          name: '日均车次',
          nameTextStyle: { color: '#94a3b8' },
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
        series: [{
          type: 'bar',
          data: [
            { value: 1800, empty: 630, emptyRate: 35, full: 1170, fullRate: 65, gasStation: 8, chargeStation: 0 },
            { value: 1550, empty: 465, emptyRate: 30, full: 1085, fullRate: 70, gasStation: 7, chargeStation: 0 },
            { value: 1400, empty: 420, emptyRate: 30, full: 980, fullRate: 70, gasStation: 6, chargeStation: 0 },
            { value: 1250, empty: 375, emptyRate: 30, full: 875, fullRate: 70, gasStation: 5, chargeStation: 0 },
            { value: 1100, empty: 330, emptyRate: 30, full: 770, fullRate: 70, gasStation: 4, chargeStation: 0 },
          ],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#d97706' },
            ]),
          },
        }],
      });
    }
  }, []);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Route className="w-5 h-5 text-blue-400" />
          不同道路类型流量及能源设施分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div ref={highwayChartRef} className="h-[280px]" />
            <div className="mt-2 text-xs text-slate-400 text-center">
              高速路段车流量大，空载率相对较低（20-30%），充电站覆盖率较高
            </div>
          </div>
          <div>
            <div ref={nationalRoadChartRef} className="h-[280px]" />
            <div className="mt-2 text-xs text-slate-400 text-center">
              国道路段车流量中等，空载率30-35%，加油站密集但充电站稀少
            </div>
          </div>
          <div>
            <div ref={provincialRoadChartRef} className="h-[280px]" />
            <div className="mt-2 text-xs text-slate-400 text-center">
              省道路段车流量较小，空载率30-35%，能源设施覆盖不足
            </div>
          </div>
        </div>

        {/* 综合分析 */}
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
          <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            道路类型选址策略分析
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-800 rounded">
              <div className="text-blue-400 font-semibold mb-2">高速公路</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                车流量大、重卡占比高，适合建设大型综合能源站。建议优先布局在物流通道交汇点，
                配置快充+换电双模式，满足长途运输需求。
              </p>
            </div>
            <div className="p-3 bg-slate-800 rounded">
              <div className="text-green-400 font-semibold mb-2">国道</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                连接城市与工业区，煤炭建材运输为主。加油站密集但充电设施空白，
                建议重点布局重卡换电站，配套停车场和维修服务。
              </p>
            </div>
            <div className="p-3 bg-slate-800 rounded">
              <div className="text-yellow-400 font-semibold mb-2">省道</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                覆盖县域经济，车流量相对较小。能源设施严重不足，建议先布局小型充电站，
                逐步完善网络，重点关注农产品运输通道。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
