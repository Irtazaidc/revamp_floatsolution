// @ts-nocheck
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,

  name: 'sortByKey',
  pure: false   // re-evaluates when anything changes (safe for UX; small lists ok)
})
export class SortByKeyPipe implements PipeTransform {
  transform(items: any[], key: string, direction: 'asc' | 'desc' = 'asc'): any[] {
    if (!Array.isArray(items) || !key) return items;

    // create a shallow copy so original array is not mutated
    const copy = [...items];

    copy.sort((a: any, b: any) => {
      const va = (a && a[key] != null ? a[key] : '').toString().toLowerCase();
      const vb = (b && b[key] != null ? b[key] : '').toString().toLowerCase();

      if (va < vb) return direction === 'asc' ? -1 : 1;
      if (va > vb) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return copy;
  }
}