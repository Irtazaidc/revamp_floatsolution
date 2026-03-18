// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { NgPagination, NgPaginationEllipsis, NgPaginationFirst, NgPaginationLast, NgPaginationNext, NgPaginationNumber, NgPaginationPrevious } from './components/paginator/ng-pagination/ng-pagination.component';
import { FormsModule } from '@angular/forms';
import { SortIconComponent } from './components/sort-icon/sort-icon.component';
import { InlineSvgDirective } from '../../../shared/inline-svg/inline-svg.directive';
@NgModule({
  declarations: [
    PaginatorComponent,
    NgPagination,
    NgPaginationEllipsis,
    NgPaginationFirst,
    NgPaginationLast,
    NgPaginationNext,
    NgPaginationNumber,
    NgPaginationPrevious,
    SortIconComponent,
  ],
  imports: [CommonModule, FormsModule, InlineSvgDirective],
  exports: [
    PaginatorComponent,
    NgPagination,
    NgPaginationEllipsis,
    NgPaginationFirst,
    NgPaginationLast,
    NgPaginationNext,
    NgPaginationNumber,
    NgPaginationPrevious,
    SortIconComponent,
  ],
})
export class CRUDTableModule { }
