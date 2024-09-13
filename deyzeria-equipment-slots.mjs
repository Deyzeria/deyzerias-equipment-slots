import ExtraEquipmentSlots from './module/config.mjs';
import registerModuleSettings, { MODULE } from './module/settings.mjs';

globalThis.Deyzeria ||= {}
globalThis.Deyzeria.SetupArmors = SetupArmors;

function SetupArmors(object) {
  for (const [id, obj] of Object.entries(object)) {
    CONFIG.DND5E.equipmentTypes[id] = obj.label;
    CONFIG.DND5E.armorProficienciesMap[id] = obj.prof;

    ExtraEquipmentSlots.ToProcess.push(
      {
        id: id,
        label: obj.label,
        category: obj.category
      }
    )
  }
}

Hooks.once("init", () => {
  registerModuleSettings();
  CONFIG.Deyzeria ||= {};
  CONFIG.Deyzeria.ExtraEquipmentSlotsCategories = ExtraEquipmentSlots.DefaultEquipmentCategories;

  if (!game.settings.get("deyzerias-equipment-slots", "fulldisable"))
  {
    SetupArmors(ExtraEquipmentSlots.DefaultEquipmentSlots);
  }
});

Hooks.once("ready", () => {
  ExtraEquipmentSlots.Final = SetupFinalForVisual();
});

Hooks.once("i18nInit", function () {
  const toLocalize = ["DefaultEquipmentCategories", "ToProcess"];

  for (let c of toLocalize) {
    const conf = foundry.utils.getProperty(ExtraEquipmentSlots, c);
    for (let [k, v] of Object.entries(conf)) {
      if (v.label) v.label = game.i18n.localize(v.label);
      if (typeof v === "string") conf[k] = game.i18n.localize(v);
    }
  }
});

// Setups ExtraEquipmentSlots.Final for the further visual display
function SetupFinalForVisual() {
  const toProcess = ExtraEquipmentSlots.ToProcess;
  const categories = game.settings.get(MODULE.id, MODULE.setting.categories);
  const final = [];

  for (const [id, obj] of Object.entries(categories)) {
    var typeUnfiltered = toProcess.filter(elem => elem.category === id);
    var typesFiltered = {};
    typeUnfiltered.forEach(element => {
      typesFiltered[element.id] = element.label
    });

    final.push({
      label: obj.default ? ExtraEquipmentSlots.DefaultEquipmentCategories[id] : obj.label,
      types: typesFiltered
    });
  }

  console.debug(categories);
  console.debug(final);
  return final;
}

Hooks.on("renderItemSheet5e", (app, html, data) => {
  if (data.item.type == 'equipment') {
    SetupArmorChoice(html, data);
  }
});

// Default Item Sheet
function SetupArmorChoice(html, data) {
  if (!html.hasClass("tidy5e-sheet")) {
    var choiceList = html.find(".details").find('.form-group [name="system.type.value"]');
    ExtraEquipmentSlots.Final.forEach(element => {
      let choices = $(`<optgroup label="${element.label}"></optgroup>`);
      for (const [armor, name] of Object.entries(element.types)) {
        choices.append(`<option value="${armor}" ${data.system.type.value == armor ? 'selected' : ''}>${name}</option>`);
      }
      choiceList.append(choices);
    });
  }
}

// Tidy item sheet
Hooks.once('tidy5e-sheet.ready', (api) => {
  ExtraEquipmentSlots.Final.forEach((group) => {
    api.config.item.registerCustomEquipmentTypeGroup(group);
  });
});