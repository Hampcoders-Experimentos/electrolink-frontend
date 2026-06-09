import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { IamStore } from '@iam/application/iam-store.service';

/**
 * Administrative user-list view.
 *
 * Read-only listing of every account registered with the platform. The view
 * is a thin shell over {@link IamStore}: it loads the user collection on
 * init and re-issues the request when the user clicks "Update".
 *
 * ### External store dependencies
 * - {@link IamStore} — exposes `users()`, `loading()`, `errorMessage()` and
 *   the `loadUsers()` side effect used here.
 *
 * ### Lifecycle
 * - `ngOnInit` triggers the initial fetch via {@link loadUsers}.
 *
 * ### Performance
 * - `OnPush` change detection; the template only reads Signals from the
 *   store so it is fully zoneless-friendly.
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListComponent implements OnInit {
  /** Application store mediating IAM data access. Read directly by the template. */
  readonly store = inject(IamStore);

  /** Fires the initial user-list fetch. */
  ngOnInit(): void {
    this.loadUsers();
  }

  /** Re-fetches the registered users from the back end. */
  loadUsers(): void {
    this.store.loadUsers().subscribe();
  }
}
