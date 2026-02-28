import { Brain, Database, Map, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export function Header({ activeModule, onModuleChange }: HeaderProps) {
  const modules = [
    { id: 'query', name: '智能问数', icon: Brain },
    { id: 'analysis', name: '数据分析', icon: Database },
    { id: 'fence', name: '围栏绘制', icon: Map },
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">智数物流</h1>
          <p className="text-xs text-slate-400">智能数据决策平台</p>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Button
              key={module.id}
              variant={activeModule === module.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModuleChange(module.id)}
              className={`flex items-center gap-2 ${
                activeModule === module.id
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{module.name}</span>
            </Button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
