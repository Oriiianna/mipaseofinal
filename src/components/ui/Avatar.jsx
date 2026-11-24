/**
 * Foto de perfil o la inicial del nombre si no hay foto.
 * @param {{name: string, url?: string|null, size?: string}} props
 */
export default function Avatar({ name, url, size = "h-12 w-12" }) {
  if (url) {
    return (
      <img src={url} alt="" className={`${size} rounded-full object-cover`} />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${size} rounded-full bg-primary-500 grid place-items-center text-white font-semibold`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
