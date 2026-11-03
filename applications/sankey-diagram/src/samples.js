import { DEFAULT_SETTINGS, normalizeProject } from './model.js';
function sample(id, name, description, category, rows, settings) {
  return { id, name, description, category, rows, settings };
}
export const SAMPLES = [
  sample('income', 'Monthly income', 'Follow earnings into essentials, lifestyle and savings.', 'Personal finance', [
    ['Salary', 'Available income', 4200], ['Freelance', 'Available income', 1200],
    ['Available income', 'Essentials', 2550], ['Available income', 'Lifestyle', 850], ['Available income', 'Future you', 2000],
    ['Essentials', 'Rent', 1550], ['Essentials', 'Groceries', 650], ['Essentials', 'Transport', 350],
    ['Lifestyle', 'Experiences', 450], ['Lifestyle', 'Shopping', 400],
    ['Future you', 'Emergency fund', 750], ['Future you', 'Investments', 1250],
  ], { title: 'Where the money flows', subtitle: 'Monthly income · an example, made yours', unit: '€' }),
  sample('energy', 'Energy in motion', 'Visualise how energy is generated, used and lost.', 'Energy', [
    ['Solar', 'Electricity', 120], ['Wind', 'Electricity', 180], ['Natural gas', 'Electricity', 100],
    ['Electricity', 'Homes', 140], ['Electricity', 'Industry', 160], ['Electricity', 'Transport', 60], ['Electricity', 'Losses', 40],
  ], { title: 'Energy in motion', subtitle: 'Generation to consumption · illustrative data', unit: 'MWh', unitPosition: 'suffix', palette: 'ocean' }),
  sample('business', 'Business revenue', 'See revenue become operating costs and profit.', 'Business', [
    ['Products', 'Revenue', 180], ['Services', 'Revenue', 120], ['Revenue', 'Operations', 160], ['Revenue', 'People', 80], ['Revenue', 'Profit', 60],
    ['Operations', 'Materials', 90], ['Operations', 'Marketing', 40], ['Operations', 'Overheads', 30], ['Profit', 'Reinvested', 40], ['Profit', 'Retained', 20],
  ], { title: 'The revenue story', subtitle: 'From revenue to impact · illustrative figures', unit: '$', palette: 'earth' }),
  sample('journey', 'Customer journey', 'Understand movement and drop-off across a funnel.', 'Analytics', [
    ['Organic search', 'Visitors', 400], ['Paid search', 'Visitors', 350], ['Referrals', 'Visitors', 250],
    ['Visitors', 'Product page', 650], ['Visitors', 'Exit', 350], ['Product page', 'Checkout', 240],
    ['Product page', 'Browse only', 410], ['Checkout', 'Purchased', 180], ['Checkout', 'Abandoned', 60],
  ], { title: 'From discovery to purchase', subtitle: 'Customer journey · example dataset', unit: '', palette: 'sunset' }),
  sample('materials', 'Circular materials', 'Map materials into products, reuse and waste.', 'Resources', [
    ['New material', 'Production', 700], ['Recycled input', 'Production', 300],
    ['Production', 'Products', 850], ['Production', 'Offcuts', 150],
    ['Products', 'In use', 680], ['Products', 'Recovered', 170], ['Offcuts', 'Recovered', 120], ['Offcuts', 'Landfill', 30],
  ], { title: 'A material journey', subtitle: 'A one-way view of reuse · illustrative data', unit: 't', unitPosition: 'suffix', palette: 'earth', theme: 'forest' }),
  sample('research', 'Study participants', 'Describe recruitment, allocation and follow-up.', 'Research', [
    ['Screened', 'Eligible', 180], ['Screened', 'Excluded', 60],
    ['Eligible', 'Intervention', 90], ['Eligible', 'Control', 90],
    ['Intervention', 'Completed intervention', 82], ['Intervention', 'Lost intervention', 8],
    ['Control', 'Completed control', 85], ['Control', 'Lost control', 5],
  ], { title: 'The participant journey', subtitle: 'Recruitment to follow-up · example study', unit: '', palette: 'accessible', theme: 'paper' }),
];
export function fromSample(id) {
  const example = SAMPLES.find((s) => s.id === id);
  if (!example) throw new Error('Unknown template.');
  const nodes = [], links = [], ids = new Map();
  const nodeId = (label) => {
    if (!ids.has(label)) { const id = 'node-' + (nodes.length + 1); ids.set(label, id); nodes.push({ id, label, color: '' }); }
    return ids.get(label);
  };
  example.rows.forEach(([source, target, value], i) => links.push({ id: 'flow-' + (i + 1), source: nodeId(source), target: nodeId(target), value, color: '' }));
  return normalizeProject({ nodes, links, settings: { ...DEFAULT_SETTINGS, ...example.settings } });
}
export function blankProject() {
  return normalizeProject({ nodes: [], links: [], settings: { ...DEFAULT_SETTINGS, title: 'Untitled flow', subtitle: '', unit: '' } });
}
