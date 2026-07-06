// SceneFX.js — environment layer. Spec: ENGINEERING.md §6.
// Phase 1 set: close-in, blackout. Others are stubs that no-op gracefully
// (logged in dev) so the score can reference them today — Phase 2 fills them in.

export class SceneFX {
  constructor() {
    this._vignette = document.getElementById('vignette');
    this._blackout = document.getElementById('blackout');
    this._redwash = document.getElementById('redwash');
    this._figura = document.getElementById('figura');
    this._whiteflash = document.getElementById('whiteflash');
    this._zippo = document.getElementById('zippo-glow');
  }

  trigger(name) {
    switch (name) {
      case 'close-in': this._vignette.classList.add('on'); break;
      case 'blackout': /* engine drives floor transitions itself */ break;
      case 'red-on': this._redwash.classList.add('on'); break;
      case 'red-off': this._redwash.classList.remove('on'); break;
      case 'figura-on': this._figura.classList.add('on'); break;
      case 'figura-close': this._figura.classList.add('on', 'close'); break;
      case 'figura-off': this._figura.classList.remove('on', 'close'); break;
      default:
        if (import.meta.env.DEV) console.debug(`[anatomia] scene "${name}" pending Phase 2`);
    }
  }

  /** Floor transition: fade to black, run swap while hidden, fade back. */
  blackout(swapFn) {
    this._blackout.classList.add('on');
    return new Promise(resolve => {
      setTimeout(() => {
        swapFn?.();
        setTimeout(() => {
          this._blackout.classList.remove('on');
          resolve();
        }, 400);
      }, 850);
    });
  }

  /** Reset per-floor layers (vignette persists only within its floor). */
  resetFloorLayers() {
    this._vignette.classList.remove('on', 'reflejo');
    this._redwash.classList.remove('on');
    this._figura.classList.remove('on', 'close');
    this._zippo.classList.remove('on');
  }
}
