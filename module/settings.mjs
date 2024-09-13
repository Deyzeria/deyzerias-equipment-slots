import { MODULE, ExtraEquipmentSlots } from "./config.mjs";
import ManualOverrideConfig from "./override-config.mjs";

export default function RegisterModuleSettings() {
  game.settings.register(MODULE.id, MODULE.setting.fulldisable, {
    name: "EQUIPMENTSLOTS.SETTINGS.FULLDISABLE.name",
    hint: "EQUIPMENTSLOTS.SETTINGS.FULLDISABLE.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true
  });

  game.settings.registerMenu(MODULE.id, MODULE.menu, {
    name: "EQUIPMENTSLOTS.SETTINGS.MANUALADDITIONS.name",
    label: "EQUIPMENTSLOTS.SETTINGS.MANUALADDITIONS.label",
    hint: "EQUIPMENTSLOTS.SETTINGS.MANUALADDITIONS.hint",
    icon: "fa-solid fa-screwdriver-wrench",
    type: ManualOverrideConfig,
    restricted: true
  });

  game.settings.register(MODULE.id, MODULE.setting.categories, {
    scope: "world",
    config: false,
    type: Object,
    default: ExtraEquipmentSlots.DefaultEquipmentCategories
  });

  game.settings.register(MODULE.id, MODULE.setting.items, {
    scope: "world",
    config: false,
    type: Object,
    default: ExtraEquipmentSlots.DefaultEquipmentSlots
  });
}