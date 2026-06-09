import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { IamStore } from '../../../application/iam-store.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListComponent implements OnInit {
  store = inject(IamStore);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.store.loadUsers().subscribe();
  }
}
