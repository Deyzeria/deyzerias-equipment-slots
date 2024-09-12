import ExtraEquipmentSlots from './config.mjs';

export class SetupArmorApi {
  /**
   * @param {Object} object 
   */
  SetupArmors(object) {
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
}

Hooks.once("init", () => {
  const setupArmor = new SetupArmorApi;
  globalThis.Deyzeria ||= {};
  globalThis.Deyzeria.SetupArmors = setupArmor.SetupArmors;

  CONFIG.Deyzeria ||= {};
  CONFIG.Deyzeria.ExtraEquipmentSlotsCategories = ExtraEquipmentSlots.DefaultEquipmentCategories;

  setupArmor.SetupArmors(ExtraEquipmentSlots.DefaultEquipmentSlots);
});

Hooks.once("ready", () => {
  ExtraEquipmentSlots.Final = SetupFinalForVisual();
});

// Setups ExtraEquipmentSlots.Final for the further visual display
function SetupFinalForVisual() {
  const toProcess = ExtraEquipmentSlots.ToProcess;
  const categories = ExtraEquipmentSlots.DefaultEquipmentCategories;
  const final = [];

  for (const [id, label] of Object.entries(categories)) {
    var typeUnfiltered = toProcess.filter(elem => elem.category === id);
    var typesFiltered = {};
    typeUnfiltered.forEach(element => {
      typesFiltered[element.id] = element.label
    });

    final.push({
      label: label,
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