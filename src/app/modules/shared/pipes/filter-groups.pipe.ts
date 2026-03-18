// @ts-nocheck
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,

  name: 'filterGroups',
  pure: false
})
export class FilterGroupsPipe implements PipeTransform {
  transform(groups: any[], searchText: string, keys: string[]): any[] {
    if (!groups) return [];
    if (!searchText) return groups;

    const keyword = searchText.toLowerCase().trim();

    return groups
      .map(group => {
        // ✅ Check if parent matches
        const parentMatches = keys.some(key =>
          (group[key] || '').toString().toLowerCase().includes(keyword)
        );

        // ✅ Check if any child matches
        const childMatches = (group.items || []).filter(item =>
          keys.some(key =>
            (item[key] || '').toString().toLowerCase().includes(keyword)
          )
        );

        // ✅ If parent matches → keep whole group
        // ✅ If children match → keep group but only matched children
        if (parentMatches || childMatches.length > 0) {
          return {
            ...group,
            items: parentMatches ? group.items : childMatches
          };
        }

        return null;
      })
      .filter(group => group !== null);
  }
}