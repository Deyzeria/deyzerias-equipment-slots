import { MODULE, ExtraEquipmentSlots } from './module/config.mjs';
import { GetNonDefaultItems } from './module/helper.mjs';
import RegisterModuleSettings from './module/settings.mjs';

globalThis.Deyzeria ||= {}
globalThis.Deyzeria.SetupArmors = SetupArmors;

function SetupArmors(object) {
  const hideDefault = game.settings.get(MODULE.id, MODULE.setting.fulldisable);
  for (const [id, obj] of Object.entries(object)) {
    CONFIG.DND5E.equipmentTypes[id] = obj.label;
    CONFIG.DND5E.armorProficienciesMap[id] = obj.prof;

    if (!hideDefault) {
      ExtraEquipmentSlots.ToProcess.push(
        {
          id: id,
          label: obj.label,
          category: obj.category
        }
      )  
    }
  }
}

Hooks.once("init", () => {
  RegisterModuleSettings();
  CONFIG.Deyzeria ||= {};
  CONFIG.Deyzeria.ExtraEquipmentSlotsCategories = {};

  const defaultArmorToSetup = game.settings.get(MODULE.id, MODULE.setting.items);
  SetupArmors(defaultArmorToSetup);
});

Hooks.once("ready", () => {
  ExtraEquipmentSlots.Final = SetupFinalForVisual();

  // This will sit here until better/worse days
  // game.settings.set(MODULE.id, MODULE.setting.items, ExtraEquipmentSlots.DefaultEquipmentSlots);
  // game.settings.set(MODULE.id, MODULE.setting.categories, ExtraEquipmentSlots.DefaultEquipmentCategories);
});

// Setups ExtraEquipmentSlots.Final for the further visual display
function SetupFinalForVisual() {
  const toProcess = ExtraEquipmentSlots.ToProcess;
  var categories = {};
  if (!game.settings.get(MODULE.id, MODULE.setting.fulldisable)) {
    categories = game.settings.get(MODULE.id, MODULE.setting.categories);
  }
  else {
    categories = GetNonDefaultItems(game.settings.get(MODULE.id, MODULE.setting.categories));
  }
  const final = [];

  for (const [id, obj] of Object.entries(categories)) {
    var typeUnfiltered = toProcess.filter(elem => elem.category === id);
    var typesFiltered = {};
    typeUnfiltered.forEach(element => {
      typesFiltered[element.id] = game.i18n.localize(element.label)
    });

    final.push({
      label: game.i18n.localize(obj.label),
      types: typesFiltered
    });
  }

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