'use client';

import { garage } from '@/config';
import { dayLabels, dayOrder, formatRanges } from '@/lib/hours';
import { useParisDay } from '@/lib/use-paris-day';
import { OpenStatus } from '@/components/ui/OpenStatus';

export function HoursTable() {
  const today = useParisDay();

  return (
    <div className="rounded-[4px] border border-bone-100/10 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[1.25rem] font-[650] tracking-[-0.015em]">Horaires d’ouverture</h3>
        <OpenStatus className="label text-steel-200" />
      </div>
      <table className="mt-6 w-full text-left">
        <caption className="sr-only">Horaires d’ouverture par jour</caption>
        <tbody>
          {dayOrder.map((d) => {
            const isToday = d === today;
            return (
              <tr key={d} className={`border-t border-bone-100/10 ${isToday ? 'text-bone-100' : 'text-steel-300'}`} aria-current={isToday ? 'date' : undefined}>
                <th scope="row" className="py-3 font-normal">
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className={`size-1.5 rounded-full ${isToday ? 'bg-accent' : 'bg-transparent'}`} />
                    {dayLabels[d]}
                    {isToday && <span className="label text-accent">Aujourd’hui</span>}
                  </span>
                </th>
                <td className="py-3 text-right tabular">{formatRanges(garage.hours[d])}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
