import type { Player } from '../entities/Player';
import type { LootSystem } from './LootSystem';
import type { InventoryUI } from '../../rendering/ui/InventoryUI';
import type { HelpUI } from '../../rendering/ui/HelpUI';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

/**
 * Handles all input events for the game
 */
export class EventHandler {
  private readonly canvas: HTMLCanvasElement;
  private readonly player: Player;
  private readonly lootSystem: LootSystem;
  private readonly inventoryUI: InventoryUI;
  private readonly helpUI: HelpUI;

  public constructor(
    canvas: HTMLCanvasElement,
    player: Player,
    lootSystem: LootSystem,
    inventoryUI: InventoryUI,
    helpUI: HelpUI
  ) {
    this.canvas = canvas;
    this.player = player;
    this.lootSystem = lootSystem;
    this.inventoryUI = inventoryUI;
    this.helpUI = helpUI;
    
    this.setupEventHandlers();
  }

  /**
   * Set up all event handlers
   */
  private setupEventHandlers(): void {
    this.setupKeyboardHandlers();
    this.setupMouseHandlers();
  }

  /**
   * Set up keyboard event handlers
   */
  private setupKeyboardHandlers(): void {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    document.addEventListener('keyup', this.handleKeyup.bind(this));
  }

  /**
   * Set up mouse event handlers
   */
  private setupMouseHandlers(): void {
    this.canvas.addEventListener('click', this.handleMouseClick.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
  }

  /**
   * Handle keydown events
   */
  private handleKeydown(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case GAME_CONSTANTS.CONTROLS.INVENTORY_TOGGLE:
        this.inventoryUI.toggle();
        break;
      case GAME_CONSTANTS.CONTROLS.HELP_TOGGLE:
        this.helpUI.toggle();
        break;
      case GAME_CONSTANTS.CONTROLS.COLLECT_ITEM:
        this.handleItemCollection();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
        this.handleHotbarSelection(event.key);
        break;
      case GAME_CONSTANTS.CONTROLS.PAUSE:
        this.handlePause();
        break;
      case GAME_CONSTANTS.CONTROLS.DEBUG_INFO:
        this.handleDebugToggle();
        break;
      default:
        // Handle movement keys through the input manager
        break;
    }
  }

  /**
   * Handle keyup events
   */
  private handleKeyup(event: KeyboardEvent): void {
    // Handle any key release events if needed
    // Movement is handled by the InputManager
  }

  /**
   * Handle mouse click events
   */
  private handleMouseClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Check UI interactions in order of priority
    if (this.handleUIClicks(mouseX, mouseY)) {
      return;
    }
    
    // Handle world interactions
    this.handleWorldClick(mouseX, mouseY);
  }

  /**
   * Handle mouse move events
   */
  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Handle UI hover effects
    this.handleUIHover(mouseX, mouseY);
  }

  /**
   * Handle right-click events
   */
  private handleRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent context menu
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Handle right-click actions (e.g., item context menus)
    this.handleRightClickActions(mouseX, mouseY);
  }

  /**
   * Handle UI click interactions
   */
  private handleUIClicks(mouseX: number, mouseY: number): boolean {
    // Check hint button first (highest priority)
    if (this.helpUI.handleHintButtonClick(mouseX, mouseY)) {
      return true;
    }
    
    // Check help UI click (if visible)
    if (this.helpUI.handleClick(mouseX, mouseY)) {
      return true;
    }
    
    // Check inventory UI click
    if (this.inventoryUI.handleClick(mouseX, mouseY)) {
      return true;
    }
    
    return false;
  }

  /**
   * Handle world click interactions
   */
  private handleWorldClick(mouseX: number, mouseY: number): void {
    // Handle clicking on game world objects
    // This can be expanded for interacting with NPCs, objects, etc.
  }

  /**
   * Handle UI hover effects
   */
  private handleUIHover(mouseX: number, mouseY: number): void {
    // Handle hover effects for UI elements
    // This can be expanded for tooltips, highlighting, etc.
  }

  /**
   * Handle right-click actions
   */
  private handleRightClickActions(mouseX: number, mouseY: number): void {
    // Handle right-click context menus, item interactions, etc.
  }

  /**
   * Handle item collection
   */
  private handleItemCollection(): void {
    const collectedDrops = this.lootSystem.checkItemCollection(
      this.player.position,
      this.player.size
    );

    collectedDrops.forEach(drop => {
      const success = this.player.collectItem(drop.getItem(), drop.getQuantity());
      if (!success) {
        // If inventory is full, put the item back
        this.lootSystem.createItemDrop(drop.getItem(), drop.getQuantity(), drop.position);
      }
    });
  }

  /**
   * Handle hotbar slot selection
   */
  private handleHotbarSelection(key: string): void {
    const slotNumber = key === '0' ? 10 : parseInt(key);
    this.inventoryUI.selectHotbarSlot(slotNumber);
  }

  /**
   * Handle pause toggle
   */
  private handlePause(): void {
    // Implement pause functionality
    // This would need to be connected to the game engine's pause state
  }

  /**
   * Handle debug info toggle
   */
  private handleDebugToggle(): void {
    // Implement debug info toggle
    // This would need to be connected to the game engine's debug state
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    document.removeEventListener('keyup', this.handleKeyup.bind(this));
    this.canvas.removeEventListener('click', this.handleMouseClick.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('contextmenu', this.handleRightClick.bind(this));
  }
}
