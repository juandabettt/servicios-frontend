export default function Avatar({ name = '', size = 10 }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-sm ring-2 ring-primary-fixed`}
    >
      {initials || '?'}
    </div>
  );
}
