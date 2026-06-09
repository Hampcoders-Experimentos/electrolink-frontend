import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfilesStore } from '../../../application/profiles-store.service';
import { Profile, ProfileRole } from '../../../domain/model/profile.entity';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css',
})
export class ProfileListComponent implements OnInit {
  store = inject(ProfilesStore);
  private router = inject(Router);

  activeFilter = signal<'ALL' | ProfileRole>('ALL');
  profileToDelete = signal<Profile | null>(null);

  allProfiles = this.store.profiles;

  ngOnInit(): void {
    this.store.loadProfiles().subscribe();
  }

  filteredProfiles(): Profile[] {
    const filter = this.activeFilter();
    const profiles = this.allProfiles();
    if (filter === 'ALL') return profiles;
    return profiles.filter(p => p.role === filter);
  }

  countByRole(role: ProfileRole): number {
    return this.allProfiles().filter(p => p.role === role).length;
  }

  setFilter(filter: 'ALL' | ProfileRole): void {
    this.activeFilter.set(filter);
  }

  goToCreate(): void {
    this.router.navigate(['/profiles/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/profiles', id, 'edit']);
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
