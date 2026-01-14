import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft,
  Clock,
  Filter,
  Download,
  Package,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, DisabledButton, EmptyTableState } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { BarChart, DonutChart } from '../../components/charts';

// Import real data
import standardTimes from '../../data/standardTimes.json';
import products from '../../data/products.json';
import oeeMetrics from '../../data/oeeMetrics.json';

interface StandardTime {
  productId: string;
  productName: string;
  phaseId: string;
  phaseName: string;
  sequence: number;
  coefficient: number;
  coefficientX: number;
}

interface ProductHours {
  id: string;
  name: string;
  type: string;
  laborHours: number;
  machineHours: number;
  totalHours: number;
  phaseCount: number;
}

export function COGSPage() {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  
  // Calculate hours for each product based on standard times
  const productHoursData = useMemo(() => {
    const productMap = new Map<string, ProductHours>();
    
    // Group standard times by product
    (standardTimes as StandardTime[]).forEach((st) => {
      if (!productMap.has(st.productId)) {
        const product = products.find(p => p.id === st.productId);
        productMap.set(st.productId, {
          id: st.productId,
          name: product?.name || st.productName,
          type: product?.type || 'Unknown',
          laborHours: 0,
          machineHours: 0,
          totalHours: 0,
          phaseCount: 0,
        });
      }
      
      const prod = productMap.get(st.productId)!;
      prod.laborHours += st.coefficient;
      prod.machineHours += st.coefficientX;
      prod.totalHours += st.coefficient + st.coefficientX;
      prod.phaseCount += 1;
    });
    
    // Convert to array and sort by total hours
    return Array.from(productMap.values())
      .filter(p => p.totalHours > 0)
      .sort((a, b) => b.totalHours - a.totalHours);
  }, []);
  
  // Get unique product types
  const productTypes = useMemo(() => {
    const types = new Set(productHoursData.map(p => p.type));
    return ['ALL', ...Array.from(types)];
  }, [productHoursData]);
  
  // Filtered data
  const filteredData = useMemo(() => {
    if (selectedType === 'ALL') return productHoursData;
    return productHoursData.filter(p => p.type === selectedType);
  }, [productHoursData, selectedType]);
  
  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const totalLabor = productHoursData.reduce((sum, p) => sum + p.laborHours, 0);
    const totalMachine = productHoursData.reduce((sum, p) => sum + p.machineHours, 0);
    const totalHours = totalLabor + totalMachine;
    const avgHours = totalHours / productHoursData.length;
    
    return {
      totalHours,
      avgHours,
      totalLabor,
      totalMachine,
      laborRatio: (totalLabor / totalHours) * 100,
      machineRatio: (totalMachine / totalHours) * 100,
    };
  }, [productHoursData]);
  
  // Hours breakdown for donut chart
  const hoursBreakdown = [
    { name: 'Mão-de-obra', value: Math.round(summaryMetrics.totalLabor) },
    { name: 'Máquina', value: Math.round(summaryMetrics.totalMachine) },
  ];
  
  // Hours by product type
  const hoursByType = useMemo(() => {
    const typeMap = new Map<string, number>();
    productHoursData.forEach((p) => {
      const current = typeMap.get(p.type) || 0;
      typeMap.set(p.type, current + p.totalHours);
    });
    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [productHoursData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-slate-600">
                <ChevronLeft size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1a2744]">Standard Times Analysis</h1>
                  <p className="text-sm text-slate-500">Production hours based on standard coefficients</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DisabledButton variant="secondary" size="sm" icon={<Filter size={14} />}>
                Filter
              </DisabledButton>
              <DisabledButton variant="secondary" size="sm" icon={<Download size={14} />}>
                Export
              </DisabledButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Notice Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={20} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Dados baseados em tempos standard do Excel (FasesStandardModelos)</p>
            <p className="text-xs text-blue-600 mt-1">
              Os valores apresentados são horas de trabalho extraídas dos coeficientes standard. 
              Não estão disponíveis custos monetários reais (taxas horárias) no sistema.
            </p>
          </div>
        </div>
        
        {/* Verified Excel Totals */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1">Totais Verificados do Excel</p>
              <p className="text-sm text-emerald-900">
                <span className="font-bold">31,437h</span> Mão-de-obra + 
                <span className="font-bold ml-1">11,666h</span> Máquina = 
                <span className="font-bold ml-1">43,103h</span> Total • 
                <span className="ml-2">Labor Ratio: <span className="font-bold">72.9%</span></span> • 
                <span className="ml-2">Média: <span className="font-bold">48.2h/produto</span></span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-600">894 modelos</p>
              <p className="text-xs text-emerald-600">15,347 registos</p>
            </div>
          </div>
        </div>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-500">Total Hours (Catalog)</span>
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{summaryMetrics.totalHours.toFixed(0)}h</p>
            <p className="text-xs text-slate-400 mt-1">{productHoursData.length} products analyzed</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-blue-500" />
              <span className="text-sm text-slate-500">Avg Hours/Product</span>
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{summaryMetrics.avgHours.toFixed(1)}h</p>
            <p className="text-xs text-slate-400 mt-1">Based on standard times</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-purple-500" />
              <span className="text-sm text-slate-500">Labor Hours Ratio</span>
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{summaryMetrics.laborRatio.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">{summaryMetrics.totalLabor.toFixed(0)}h total</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-sm text-slate-500">Rework Rate</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{oeeMetrics.reworkRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Impacts total production time</p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Hours by Product Type */}
          <Card className="col-span-8" padding="md">
            <CardHeader 
              title="Hours by Product Type" 
              subtitle="Total standard hours breakdown by kayak type"
              size="sm"
            />
            <BarChart data={hoursByType} height={200} showGrid showAxis color="#3b82f6" />
          </Card>

          {/* Hours breakdown */}
          <Card className="col-span-4" padding="md">
            <CardHeader title="Labor vs Machine Hours" size="sm" />
            <div className="grid grid-cols-2 gap-4 items-start">
              <DonutChart 
                data={hoursBreakdown} 
                height={130}
                innerRadius={35}
                outerRadius={55}
                centerValue="100%"
              />
              <div className="space-y-3 pt-2">
                {hoursBreakdown.map((component, index) => (
                  <div key={component.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ['#3b82f6', '#22c55e'][index] }}
                      />
                      <span className="text-slate-600">{component.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 tabular-nums">{component.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-500">Filter by type:</span>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {productTypes.slice(0, 6).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedType === type 
                    ? 'bg-white text-[#1a2744] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Product Hours Table */}
        <Card padding="none">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <CardHeader title="Product Standard Hours" subtitle="Manufacturing time coefficients per product" size="sm" />
            <Link to="/profit/oee">
              <Button variant="secondary" size="sm" icon={<Clock size={14} />}>
                View OEE Analysis
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Product</TableHeader>
                  <TableHeader align="right">Type</TableHeader>
                  <TableHeader align="right">Labor Hours</TableHeader>
                  <TableHeader align="right">Machine Hours</TableHeader>
                  <TableHeader align="right">Total Hours</TableHeader>
                  <TableHeader align="right">Phases</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(0, 25).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium text-slate-900">{product.name}</span>
                        <span className="text-slate-400 ml-2 text-xs">#{product.id}</span>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <Badge variant={
                        product.type.startsWith('K') ? 'primary' : 
                        product.type.startsWith('C') ? 'warning' : 
                        'secondary'
                      }>
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell align="right" mono>{product.laborHours.toFixed(2)}h</TableCell>
                    <TableCell align="right" mono>{product.machineHours.toFixed(2)}h</TableCell>
                    <TableCell align="right" mono className="font-bold text-[#1a2744]">
                      {product.totalHours.toFixed(2)}h
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-xs text-slate-500">{product.phaseCount}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.slice(0, 25).length === 0 && (
                  <EmptyTableState 
                    title="Sem produtos encontrados"
                    message="Nenhum produto corresponde ao tipo selecionado."
                  />
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredData.length > 25 && (
            <div className="px-4 py-3 border-t border-slate-100 text-center">
              <span className="text-sm text-slate-500">
                Showing 25 of {filteredData.length} products
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
