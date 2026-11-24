import { Check, Minus } from "lucide-react";
import { WEEKDAYS, hasSlot } from "../../utils/schedule";

/**
 * Grilla de disponibilidad: días de la semana × franjas horarias.
 * Si recibe onToggle es editable; si no, es de solo lectura.
 * @param {{ timeSlots: Array<object>, slots: Array<{ weekday: number, time_slot_id: number }>, onToggle?: (weekday: number, timeSlotId: number) => void }} props
 */
export default function AvailabilityGrid({ timeSlots, slots, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Disponibilidad por día y franja horaria
        </caption>
        <thead>
          <tr>
            <td />
            {WEEKDAYS.map((day) => (
              <th
                key={day.value}
                scope="col"
                className="p-2 font-semibold text-gray-700"
              >
                <abbr title={day.label} className="no-underline">
                  {day.short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.id}>
              <th
                scope="row"
                className="p-2 text-left font-semibold text-gray-700"
              >
                {slot.name}
              </th>
              {WEEKDAYS.map((day) => {
                const active = hasSlot(slots, day.value, slot.id);
                return (
                  <td key={day.value} className="p-1 text-center">
                    {onToggle ? (
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => onToggle(day.value, slot.id)}
                        aria-label={`${day.label} a la ${slot.name.toLowerCase()}`}
                        className="h-5 w-5 accent-primary-600"
                      />
                    ) : (
                      <span
                        className={`inline-grid h-8 w-8 place-items-center rounded-md ${
                          active
                            ? "bg-primary-100 text-primary-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {active ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {active ? "Disponible" : "No disponible"}
                        </span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
