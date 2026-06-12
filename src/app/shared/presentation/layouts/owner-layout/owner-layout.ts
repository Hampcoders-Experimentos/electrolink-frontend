import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { IamStore } from '@iam/application/iam-store.service';
import { IconComponent, IconName } from '../../components/icon/icon';

/**
 * Declarative descriptor for an entry rendered inside the sidebar navigation.
 *
 * @property label - User-facing label shown next to the icon.
 * @property icon  - Key recognised by {@link IconComponent} (registered SVG).
 * @property path  - Absolute router path the entry navigates to.
 */
interface MenuItem {
  readonly label: string;
  readonly icon: IconName;
  readonly path: string;
}

/**
 * Shell layout for the Owner portal.
 *
 * Visual specification: Figma frame `106:10150` (sidebar + content area).
 *
 * ### Responsibilities
 * - Renders the fixed-width sidebar with brand area, navigation menu and the
 *   support / current-user footer.
 * - Hosts the routed feature page via `<router-outlet />` inside the main pane.
 *
 * ### External store dependencies
 * - {@link IamStore} — read for `currentUser()` (sidebar footer) and called
 *   on `logout()` to clear the IAM session.
 */
@Component({
  selector: 'el-owner-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, IconComponent],
  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayoutComponent {
  /** IAM store: read-only access to the current user and `logout()` action. */
  readonly store = inject(IamStore);

  /** Router used for navigation and active-route detection. */
  private readonly router = inject(Router);

  /** Static menu definition rendered by the template's `@for` block. */
  readonly menu: ReadonlyArray<MenuItem> = [
    { label: 'Dashboard',          icon: 'home',        path: '/owner/dashboard'   },
    { label: 'Mis Propiedades',    icon: 'building',    path: '/owner/properties'  },
    { label: 'Solicitar Servicio', icon: 'plus-circle', path: '/owner/new-request' },
    { label: 'Analytics',          icon: 'chart-bar',   path: '/owner/analytics'   },
  ];

  /**
   * Navigates to the supplied router path.
   *
   * @param path - Absolute router path to navigate to.
   */
  navigate(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Returns whether the supplied path matches the current URL prefix.
   * Used by the template to style the active menu entry.
   *
   * @param path - Path to test against the active URL.
   */
  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  /** Clears the IAM session and routes back to the sign-in view. */
  logout(): void {
    this.store.logout();
    this.router.navigate(['/iam/sign-in']);
  }
}
