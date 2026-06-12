import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Compile-time-safe set of icon identifiers.
 *
 * Each member maps 1:1 to a `<symbol id="…">` inside the consolidated sprite
 * sheet at `public/assets/icons/icons.svg`. Typing {@link IconComponent.name}
 * against this union prevents "string hallucinations": referencing an icon
 * that does not exist in the sprite becomes a build error rather than a blank
 * render at runtime.
 *
 * To add an icon: add the `<symbol>` to `icons.svg` and append its id here.
 */
export type IconName =
  | 'bolt'
  | 'home'
  | 'building'
  | 'plus-circle'
  | 'plus'
  | 'chart-bar'
  | 'chart-line'
  | 'headphones'
  | 'user'
  | 'sign-out'
  | 'list'
  | 'box'
  | 'check-circle'
  | 'dollar'
  | 'clock'
  | 'wrench'
  | 'star'
  | 'star-fill'
  | 'arrow'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-right'
  | 'times'
  | 'times-circle'
  | 'check'
  | 'lock'
  | 'warning'
  | 'info'
  | 'money-bill'
  | 'briefcase'
  | 'search'
  | 'pencil'
  | 'trash'
  | 'eye'
  | 'send'
  | 'inbox'
  | 'camera'
  | 'cloud-upload'
  | 'history'
  | 'info-circle'
  | 'play'
  | 'map-marker'
  | 'map'
  | 'file-edit'
  | 'file'
  | 'cog'
  | 'shield'
  | 'spinner'
  | 'save'
  | 'crown'
  | 'calendar'
  | 'exclamation-triangle'
  | 'exclamation-circle'
  | 'tag'
  | 'file-excel'
  | 'align-left';

/** Path to the shared sprite sheet, served from `public/` at the web root. */
const SPRITE_URL = 'assets/icons/icons.svg';

/**
 * SVG icon renderer for the Electrolink design system.
 *
 * Rather than embedding raw SVG path strings in the JS bundle, the component
 * references symbols from a single consolidated sprite sheet
 * (`assets/icons/icons.svg`) via the native `<use>` mechanism. The browser
 * fetches the sprite **once** and caches it, so every icon on every route
 * reuses the same cached asset instead of shipping path data inside the
 * component runtime.
 *
 * ### Inputs
 * - {@link name} *(required)* — strongly-typed {@link IconName}. Invalid ids
 *   are rejected at compile time.
 * - {@link size} — CSS length for both width and height (default `1em`).
 *   Accepts any valid CSS dimension (`1rem`, `24px`, `100%`).
 * - {@link strokeWidth} — Stroke width forwarded to the SVG.
 * - {@link viewBox} — SVG viewBox; defaults to the 24px design grid.
 * - {@link ariaLabel} — When provided, the icon is exposed as
 *   `role="img"` with the supplied label; otherwise it is treated as
 *   decorative (`aria-hidden="true"`).
 *
 * ### Performance
 * - `ChangeDetection.OnPush` and signal inputs make the component
 *   zoneless-friendly. The {@link iconPath} computed signal recomputes only
 *   when {@link name} changes, never on parent CD passes.
 */
@Component({
  selector: 'el-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class IconComponent {
  /** Strongly-typed identifier of the sprite symbol to render. */
  readonly name = input.required<IconName>();

  /** Width/height as a CSS length. Accepts any valid CSS dimension. */
  readonly size = input<string>('1em');

  /** SVG `stroke-width` attribute. */
  readonly strokeWidth = input<number>(1.75);

  /** SVG `viewBox`. Defaults to the 24px design grid. */
  readonly viewBox = input<string>('0 0 24 24');

  /**
   * Optional accessibility label. When empty, the icon is treated as
   * purely decorative and hidden from assistive tech.
   */
  readonly ariaLabel = input<string>('');

  /**
   * Fully-qualified reference to the active symbol inside the sprite sheet,
   * e.g. `assets/icons/icons.svg#bolt`. Consumed by the `<use>` element in the
   * template and recomputed only when {@link name} changes.
   */
  protected readonly iconPath = computed(() => `${SPRITE_URL}#${this.name()}`);
}
