export default function registerModuleSettings() {
  game.settings.register("deyzerias-equipment-slots", "fulldisable", {
    name: "EQUIPMENTSLOTS.SETTINGS.FULLDISABLE.name",
    hint: "EQUIPMENTSLOTS.SETTINGS.FULLDISABLE.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true
  });

  //game.settings.registerMenu("deyzerias-equipment-slots", "")
}