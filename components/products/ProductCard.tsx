import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

export interface ProductItemProps {
  product: {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    image?: string | null;
    quantity?: number | null;
    business: { name: string; slug: string; phone: string; isVerified?: boolean; cityName?: string };
  };
}

export default function ProductCard({ product }: ProductItemProps) {
  const discount = product.discountPercentage || (product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null);

  return (
    <article className="group min-w-0 rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg">
      <Link href={`/business/${product.business.slug}#products`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50">
          <Image
            src={product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'}
            alt={product.title}
            fill
            sizes="(max-width: 767px) 33vw, (max-width: 1023px) 25vw, 16vw"
            className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          />
          {discount && <span className="absolute right-1 top-1 rounded bg-amber-50 px-1 py-0.5 text-[10px] font-bold text-amber-700">-{discount}%</span>}
        </div>
        <div className="space-y-1 px-1 pb-1 pt-2">
          <h3 className="line-clamp-2 min-h-9 text-xs font-medium leading-tight text-slate-800 sm:text-sm">{product.title}</h3>
          {product.description && <p className="hidden text-[11px] leading-snug text-slate-500 lg:line-clamp-1">{product.description}</p>}
          <p className="text-sm font-extrabold text-slate-950 sm:text-base">{product.price > 0 ? formatGHS(product.price) : 'Contact for price'}</p>
          {product.originalPrice && product.originalPrice > product.price && <p className="text-[11px] text-slate-400 line-through">{formatGHS(product.originalPrice)}</p>}
        </div>
      </Link>
      <Link href={`/business/${product.business.slug}#products`} className="mx-1 mb-1 flex items-center justify-center gap-1 rounded-md border border-sea/30 py-1.5 text-[11px] font-bold text-sea transition-colors hover:bg-brand-50">
        View &amp; contact <ArrowRight className="h-3 w-3" />
      </Link>
    </article>
  );
}
