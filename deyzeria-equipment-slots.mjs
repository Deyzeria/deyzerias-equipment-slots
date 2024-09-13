import { MODULE, ExtraEquipmentSlots } from './module/config.mjs';
import { GetNonDefaultItems } from './module/helper.mjs';
import RegisterModuleSettings from './module/settings.mjs';

globalThis.Deyzeria ||= {}
globalThis.Deyzeria.SetupArmors = SetupArmors;

function SetupArmors(object, hideDefaultSetting = false, moduleAdded = true) {
  for (const [id, obj] of Object.entries(object)) {
    CONFIG.DND5E.equipmentTypes[id] = obj.label;
    CONFIG.DND5E.armorProficienciesMap[id] = obj.prof;

    if (!hideDefaultSetting || (!obj.default ?? true)) {
      ExtraEquipmentSlots.ToProcess.push(
        {
          id: id,
          label: obj.label,
          category: obj.category
        }
      )
    }

    if (moduleAdded) {
      ExtraEquipmentSlots.ModuleEquipmentSlots[id] = {
        label: obj.label,
        prof: obj.prof,
        category: obj.category,
        value: true,
        default: false,
        module: true
      };
    }
  }
}

Hooks.once("init", () => {
  RegisterModuleSettings();
  CONFIG.Deyzeria ||= {};
  CONFIG.Deyzeria.ExtraEquipmentSlotsCategories = {};

  SetupArmors(game.settings.get(MODULE.id, MODULE.setting.items), game.settings.get(MODULE.id, MODULE.setting.fulldisable), false);
});

Hooks.once("ready", () => {
  ExtraEquipmentSlots.Final = SetupFinalForVisual();

  // This will sit here until better/worse days. This is a verrrry manual hard-reset
  // game.settings.set(MODULE.id, MODULE.setting.items, ExtraEquipmentSlots.DefaultEquipmentSlots);
  // game.settings.set(MODULE.id, MODULE.setting.categories, ExtraEquipmentSlots.DefaultEquipmentCategories);
});

// Setups ExtraEquipmentSlots.Final for the further visual display
function SetupFinalForVisual() {
  const toProcess = ExtraEquipmentSlots.ToProcess;
  var categories = game.settings.get(MODULE.id, MODULE.setting.categories);
  const items = game.settings.get(MODULE.id, MODULE.setting.items);
  // Handling manually arriving categories
  for (const [id, label] of Object.entries(CONFIG.Deyzeria.ExtraEquipmentSlotsCategories)) {
    categories[id] = { label: label, value: true, default: false, module: true };
  }
  for (const [id, obj] of Object.entries(ExtraEquipmentSlots.ModuleEquipmentSlots)) {
    items[id] = obj;
  }

  if (game.settings.get(MODULE.id, MODULE.setting.fulldisable)) {
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