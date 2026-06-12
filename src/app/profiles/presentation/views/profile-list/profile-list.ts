import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfilesStore } from '@profiles/application/profiles-store.service';
import { Profile, ProfileRole } from '@profiles/domain/model/profile.entity';
import { IconComponent } from '@shared/presentation/components/icon/icon';

/**
 * Profile catalogue view.
 *
 * Card grid filterable by role (`ALL` / `HOMEOWNER` / `TECHNICIAN`) with an
 * inline delete-confirmation modal.
 *
 * ### State signals
 * - {@link activeFilter}     - Selected filter tab.
 * - {@link profileToDelete}  - When non-null, opens the confirmation modal.
 * - {@link allProfiles}      - Mirror of `ProfilesStore.profiles` for direct read.
 *
 * ### External dependencies
 * - {@link ProfilesStore} — `loadProfiles`, `deleteProfile`, `profiles()`,
 *   `loading()`, `errorMessage()`.
 *
 * ### Lifecycle
 * - `ngOnInit` issues the initial fetch via the store.
 */
@Component({
  selector: 'app-profile-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css',
})
export class ProfileListComponent implements OnInit {
  store = inject(ProfilesStore);
  private router = inject(Router);

  activeFilter = signal<'ALL' | ProfileRole>('ALL');
  profileToDelete = signal<Profile | null>(null);

  allProfiles = this.store.profiles;

  /**
   * Profiles matching the active filter.
   * Computed Signal — recomputes only when either {@link activeFilter} or
   * the underlying store collection changes, avoiding per-CD recomputation.
   */
  readonly filteredProfiles = computed<Profile[]>(() => {
    const filter = this.activeFilter();
    const profiles = this.allProfiles();
    return filter === 'ALL' ? profiles : profiles.filter(p => p.role === filter);
  });

  /**
   * Role counts memoized off the store collection. Lookup is O(1) per tab
   * because the entire `{HOMEOWNER, TECHNICIAN}` map is computed in a single
   * pass and accessed by key from the template.
   */
  readonly profileCountByRole = computed<Record<ProfileRole, number>>(() => {
    const counts: Record<ProfileRole, number> = { HOMEOWNER: 0, TECHNICIAN: 0 };
    for (const p of this.allProfiles()) counts[p.role]++;
    return counts;
  });

  ngOnInit(): void {
    this.store.loadProfiles().subscribe();
  }

  /**
   * Convenience accessor for the template — reads from the memoized
   * {@link profileCountByRole} map without re-iterating the source list.
   *
   * @param role - Role to look up.
   */
  countByRole(role: ProfileRole): number {
    return this.profileCountByRole()[role];
  }

  setFilter(filter: 'ALL' | ProfileRole): void {
    this.activeFilter.set(filter);
  }

  goToCreate(): void {
    this.router.navigate(['/profiles/new']).then();
  }

  goToEdit(id: number): void {
    this.router.navigate(['/profiles', id, 'edit']).then();
  }

  confirmDelete(profile: Profile): void {
    this.profileToDelete.set(profile);
  }

  cancelDelete(): void {
    this.profileToDelete.set(null);
  }

  executeDelete(): void {
    const profile = this.profileToDelete();
    if (profile) {
      this.store.deleteProfile(profile.id).subscribe({
        next: () => this.profileToDelete.set(null)
      });
    }
  }
}
