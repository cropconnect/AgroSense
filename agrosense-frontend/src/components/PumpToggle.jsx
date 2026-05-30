import { Power } from 'lucide-react';

export default function PumpToggle({ active, onClick }) {
  return (
    <button onClick={onClick} className={`btn h-12 w-full ${active ? 'btn-primary' : 'btn-ghost'}`}>
      <Power size={18} />
      {active ? 'Pump On' : 'Pump Off'}
    </button>
  );
}
