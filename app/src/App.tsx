import { useState } from 'react';
import { Header } from './sections/Header';
import { SmartQueryAgent } from './sections/SmartQueryAgent';
import { DataDetailTable } from './sections/DataDetailTable';
import { SmartAnalysisAgent } from './sections/SmartAnalysisAgent';
import { FenceDrawer } from './sections/FenceDrawer';

function App() {
  const [activeModule, setActiveModule] = useState('query');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header activeModule={activeModule} onModuleChange={setActiveModule} />
      
      <main className="flex-1 p-4 overflow-hidden">
        {activeModule === 'query' && (
          <div className="h-full grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <SmartQueryAgent />
            </div>
            <div className="col-span-2">
              <DataDetailTable />
            </div>
          </div>
        )}
        
        {activeModule === 'analysis' && <SmartAnalysisAgent />}
        
        {activeModule === 'fence' && <FenceDrawer />}
      </main>
    </div>
  );
}

export default App;
