import { useState, useRef } from 'react';
import { Map, Circle, Square, Hexagon, MousePointer, Trash2, Save, Download, Layers, Ruler, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 围栏类型
type FenceType = 'circle' | 'polygon' | 'rectangle' | null;

// 围栏数据
interface Fence {
  id: string;
  name: string;
  type: FenceType;
  center?: { lng: number; lat: number };
  radius?: number;
  points?: { lng: number; lat: number }[];
  area: number;
  createdAt: Date;
}

// 模拟围栏内数据
const MOCK_FENCE_DATA = {
  vehicles: 156,
  enterprises: 23,
  monthlyFlow: 4520,
  avgStayTime: 2.5,
  mainCargo: ['煤炭', '钢铁', '水泥'],
};

// 模拟车辆数据
const MOCK_VEHICLE_DATA = [
  { plate: '晋C3XX1', type: '重型半挂牵引车', enterTime: '2024-10-15 08:30:00', stayTime: '3.5h', cargo: '煤炭', weight: 40000 },
  { plate: '鲁B5XX8', type: '重型半挂牵引车', enterTime: '2024-10-15 09:15:30', stayTime: '2.0h', cargo: '钢铁', weight: 35000 },
  { plate: '粤K8XX2', type: '重型仓栅式货车', enterTime: '2024-10-15 10:20:00', stayTime: '1.5h', cargo: '粮食', weight: 25000 },
  { plate: '冀E8XX3', type: '重型自卸货车', enterTime: '2024-10-15 11:00:00', stayTime: '4.0h', cargo: '钢材', weight: 45000 },
  { plate: '辽F7XX4', type: '重型半挂牵引车', enterTime: '2024-10-15 12:30:00', stayTime: '2.5h', cargo: '农产品', weight: 22000 },
];

export function FenceDrawer() {
  const [activeTool, setActiveTool] = useState<FenceType>(null);
  const [fences, setFences] = useState<Fence[]>([]);
  const [selectedFence, setSelectedFence] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newFenceName, setNewFenceName] = useState('');
  const [showDataPanel, setShowDataPanel] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 模拟绘制围栏
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool || !isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 模拟创建围栏
    const newFence: Fence = {
      id: Date.now().toString(),
      name: newFenceName || `围栏${fences.length + 1}`,
      type: activeTool,
      center: { lng: 116.4074 + (x - 300) / 1000, lat: 39.9042 + (y - 175) / 1000 },
      radius: activeTool === 'circle' ? 50 : undefined,
      area: activeTool === 'circle' ? Math.PI * 50 * 50 : 2500,
      createdAt: new Date(),
    };

    setFences([...fences, newFence]);
    setIsDrawing(false);
    setActiveTool(null);
    setNewFenceName('');
    setShowDataPanel(true);
  };

  const deleteFence = (id: string) => {
    setFences(fences.filter(f => f.id !== id));
    if (selectedFence === id) {
      setSelectedFence(null);
      setShowDataPanel(false);
    }
  };

  const startDrawing = (type: FenceType) => {
    setActiveTool(type);
    setIsDrawing(true);
  };

  return (
    <div className="h-full flex gap-4">
      {/* 左侧工具栏 */}
      <Card className="w-64 bg-slate-900 border-slate-800 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-blue-400" />
            绘制工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => startDrawing('circle')}
              className={activeTool === 'circle' ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
            >
              <Circle className="w-4 h-4 mr-1" />
              圆形
            </Button>
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => startDrawing('rectangle')}
              className={activeTool === 'rectangle' ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
            >
              <Square className="w-4 h-4 mr-1" />
              矩形
            </Button>
            <Button
              variant={activeTool === 'polygon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => startDrawing('polygon')}
              className={activeTool === 'polygon' ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
            >
              <Hexagon className="w-4 h-4 mr-1" />
              多边形
            </Button>
          </div>

          {isDrawing && (
            <div className="space-y-2 p-3 bg-slate-800 rounded-lg">
              <Label className="text-slate-300 text-sm">围栏名称</Label>
              <Input
                value={newFenceName}
                onChange={(e) => setNewFenceName(e.target.value)}
                placeholder="输入围栏名称"
                className="bg-slate-900 border-slate-700 text-white text-sm"
              />
              <p className="text-xs text-slate-500">点击地图绘制围栏</p>
            </div>
          )}

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-sm text-slate-400 mb-2">已保存围栏 ({fences.length})</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {fences.map((fence) => (
                  <div
                    key={fence.id}
                    onClick={() => {
                      setSelectedFence(fence.id);
                      setShowDataPanel(true);
                    }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFence === fence.id ? 'bg-blue-600/20 border border-blue-600' : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">{fence.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-slate-500 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFence(fence.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-500">
                        {fence.type === 'circle' ? '圆形' : fence.type === 'rectangle' ? '矩形' : '多边形'}
                      </Badge>
                      <span className="text-xs text-slate-500">{fence.area.toFixed(0)} km²</span>
                    </div>
                  </div>
                ))}
                {fences.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-4">
                    暂无围栏数据
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* 中间地图区域 */}
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex-1 bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-400" />
                围栏绘制
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  <Ruler className="w-3 h-3 mr-1" />
                  测距工具
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  <Layers className="w-3 h-3 mr-1" />
                  图层切换
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="relative h-[500px] bg-slate-950 rounded-b-lg overflow-hidden">
              {/* 模拟地图画布 */}
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                onClick={handleCanvasClick}
                className={`w-full h-full ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
              />
              
              {/* 地图背景（SVG模拟） */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <rect width="100%" height="100%" fill="#0f172a" />
                
                {/* 网格线 */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* 简化的道路 */}
                <line x1="100" y1="250" x2="700" y2="250" stroke="#334155" strokeWidth="4" />
                <line x1="400" y1="50" x2="400" y2="450" stroke="#334155" strokeWidth="4" />
                <line x1="200" y1="100" x2="600" y2="400" stroke="#334155" strokeWidth="2" />
                <line x1="600" y1="100" x2="200" y2="400" stroke="#334155" strokeWidth="2" />

                {/* 绘制的围栏 */}
                {fences.map((fence) => {
                  if (fence.type === 'circle' && fence.center && fence.radius) {
                    const x = ((fence.center.lng - 116.4074) * 1000) + 400;
                    const y = ((fence.center.lat - 39.9042) * 1000) + 250;
                    return (
                      <g key={fence.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={fence.radius}
                          fill="rgba(59, 130, 246, 0.2)"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                        <text x={x} y={y - fence.radius - 10} textAnchor="middle" fill="#94a3b8" fontSize="12">
                          {fence.name}
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}

                {/* 绘制提示 */}
                {isDrawing && activeTool && (
                  <text x="400" y="30" textAnchor="middle" fill="#3b82f6" fontSize="14">
                    点击地图放置{activeTool === 'circle' ? '圆形' : activeTool === 'rectangle' ? '矩形' : '多边形'}围栏
                  </text>
                )}
              </svg>

              {/* 图例 */}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-2">图例</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-blue-500 bg-blue-500/20" />
                    <span className="text-xs text-slate-500">围栏范围</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-slate-600" />
                    <span className="text-xs text-slate-500">主要道路</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧数据面板 */}
      {showDataPanel && (
        <Card className="w-80 bg-slate-900 border-slate-800 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-green-400" />
                围栏数据统计
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-slate-500"
                onClick={() => setShowDataPanel(false)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full bg-slate-800">
                <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-blue-600">概览</TabsTrigger>
                <TabsTrigger value="vehicles" className="flex-1 data-[state=active]:bg-blue-600">车辆</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_FENCE_DATA.vehicles}</div>
                    <div className="text-xs text-slate-400">活跃车辆</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_FENCE_DATA.enterprises}</div>
                    <div className="text-xs text-slate-400">企业数</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_FENCE_DATA.monthlyFlow}</div>
                    <div className="text-xs text-slate-400">月流量</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_FENCE_DATA.avgStayTime}h</div>
                    <div className="text-xs text-slate-400">平均停留</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">主要货类</div>
                  <div className="flex flex-wrap gap-1">
                    {MOCK_FENCE_DATA.mainCargo.map((cargo) => (
                      <Badge key={cargo} variant="outline" className="border-slate-600 text-slate-300">
                        {cargo}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-slate-700 text-slate-300">
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-slate-700 text-slate-300">
                    <Download className="w-4 h-4 mr-1" />
                    导出
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-4">
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400 text-xs">车牌</TableHead>
                        <TableHead className="text-slate-400 text-xs">货类</TableHead>
                        <TableHead className="text-slate-400 text-xs">停留</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_VEHICLE_DATA.map((vehicle) => (
                        <TableRow key={vehicle.plate} className="border-slate-800">
                          <TableCell className="text-slate-300 text-xs">{vehicle.plate}</TableCell>
                          <TableCell className="text-slate-400 text-xs">{vehicle.cargo}</TableCell>
                          <TableCell className="text-slate-400 text-xs">{vehicle.stayTime}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
