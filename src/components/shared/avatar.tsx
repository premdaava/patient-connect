import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
}

const colors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

function getColorFromString(str: string): string {
  const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  const colorClass = getColorFromString(fallback);

  return (
    <AvatarPrimitive className={className}>
      {src && <AvatarImage src={src} alt={alt || fallback} />}
      <AvatarFallback className={cn(colorClass, 'text-white')}>
        {fallback}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}
