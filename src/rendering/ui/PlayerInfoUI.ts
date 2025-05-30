import type { Player } from '../../game/entities/Player';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface PlayerInfoUIConfig {
  readonly containerId: string;
}

export class PlayerInfoUI {
  private readonly config: PlayerInfoUIConfig;
  private player: Player | null;
  private readonly elements: {
    level: HTMLElement | null;
    hp: HTMLElement | null;
    maxHp: HTMLElement | null;
    mp: HTMLElement | null;
    maxMp: HTMLElement | null;
    attack: HTMLElement | null;
    defense: HTMLElement | null;
    speed: HTMLElement | null;
    experience: HTMLElement | null;
    experienceToNext: HTMLElement | null;
    healthBarFill: HTMLElement | null;
    manaBarFill: HTMLElement | null;
  };

  public constructor(config: PlayerInfoUIConfig) {
    this.config = config;
    this.player = null;
    
    // Get references to HTML elements
    this.elements = {
      level: document.getElementById('stat-level'),
      hp: document.getElementById('stat-hp'),
      maxHp: document.getElementById('stat-max-hp'),
      mp: document.getElementById('stat-mp'),
      maxMp: document.getElementById('stat-max-mp'),
      attack: document.getElementById('stat-attack'),
      defense: document.getElementById('stat-defense'),
      speed: document.getElementById('stat-speed'),
      experience: document.getElementById('stat-experience'),
      experienceToNext: document.getElementById('stat-experience-to-next'),
      healthBarFill: document.getElementById('health-bar-fill'),
      manaBarFill: document.getElementById('mana-bar-fill')
    };
  }

  public setPlayer(player: Player): void {
    this.player = player;
  }

  public render(): void {
    if (!this.player) return;

    const stats = this.player.getStats();
    
    // Update text elements
    if (this.elements.level) this.elements.level.textContent = stats.level.toString();
    if (this.elements.hp) this.elements.hp.textContent = stats.health.toString();
    if (this.elements.maxHp) this.elements.maxHp.textContent = stats.maxHealth.toString();
    if (this.elements.mp) this.elements.mp.textContent = stats.mana.toString();
    if (this.elements.maxMp) this.elements.maxMp.textContent = stats.maxMana.toString();
    if (this.elements.attack) this.elements.attack.textContent = stats.attack.toString();
    if (this.elements.defense) this.elements.defense.textContent = stats.defense.toString();
    if (this.elements.speed) this.elements.speed.textContent = stats.speed.toString();
    if (this.elements.experience) this.elements.experience.textContent = stats.experience.toString();
    if (this.elements.experienceToNext) this.elements.experienceToNext.textContent = stats.experienceToNext.toString();
    
    // Update health bar
    if (this.elements.healthBarFill) {
      const healthPercent = (stats.health / stats.maxHealth) * 100;
      this.elements.healthBarFill.style.width = `${healthPercent}%`;
      
      // Update health bar color based on percentage
      this.elements.healthBarFill.className = 'health-bar-fill';
      if (healthPercent <= 25) {
        this.elements.healthBarFill.classList.add('low');
      } else if (healthPercent <= 50) {
        this.elements.healthBarFill.classList.add('medium');
      }
    }
    
    // Update mana bar
    if (this.elements.manaBarFill) {
      const manaPercent = (stats.mana / stats.maxMana) * 100;
      this.elements.manaBarFill.style.width = `${manaPercent}%`;
    }
  }
}
