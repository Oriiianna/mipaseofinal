/**
 * Campo de formulario: etiqueta, ícono opcional y mensaje de error.
 * El control (input, select o textarea) va como children.
 * @param {{ id: string, label: string, icon?: Function, error?: string, children: React.ReactNode }} props
 */
export default function FormField({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        )}
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
