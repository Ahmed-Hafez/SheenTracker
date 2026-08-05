import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-users-permisions',
  imports: [TableModule],
  templateUrl: './users-permisions.component.html',
  styleUrl: './users-permisions.component.scss',
})
export class UsersPermisionsComponent {
  products!: String[];
}
