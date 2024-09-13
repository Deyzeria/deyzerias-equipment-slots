import ExtraEquipmentSlots from "./config.mjs";

export const MODULE = {
  id: "deyzerias-equipment-slots",
  menu: "manualoverridemenu",
  setting: {
    fulldisable: "fulldisable",
    categoriesdisable: "categoriesdisable",
    categories: "categories",
    itemsdisable: "itemsdisable",
    itemsnew: "itemsnew",
  }
}

export default function registerModuleSettings() {
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
    default: {
      extraslots: {
        value: true,
        default: true
      },
      helmet: {
        value: true,
        default: true
      },
      gloves: {
        value: true,
        default: true
      },
      pants: {
        value: true,
        default: true
      },
      boots: {
        value: true,
        default: true
      }
    }
  });

  game.settings.register(MODULE.id, MODULE.setting.itemsdisable, {
    scope: "world",
    config: false,
    type: Object,
    default: {
      clothhat: true,
      clothpants: true,
      clothhands: true,
      clothboots: true,
      ring: true,
      neck: true,
      face: true,
      belt: true,
      bracers: true,
      back: true,
      lighthat: true,
      lightpants: true,
      lighthands: true,
      lightboots: true,
      mediumhat: true,
      mediumpants: true,
      mediumhands: true,
      mediumboots: true,
      heavyhat: true,
      heavypants: true,
      heavyhands: true,
      heavyboots: true
    }
  });

  game.settings.register(MODULE.id, MODULE.setting.itemsnew, {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
}

class ManualOverrideConfig extends FormApplication {
  /** @inheritdoc */
  constructor(object = {}, options = {}) {
    const categories = game.settings.get(MODULE.id, MODULE.setting.categories);
    const itemsDisable = game.settings.get(MODULE.id, MODULE.setting.itemsdisable);
    const itemsNew = game.settings.get(MODULE.id, MODULE.setting.itemsnew);

    const categoriesAndItems = {
      categories: categories,
      itemsDisable: itemsDisable,
      itemsNew: itemsNew
    }

    object = foundry.utils.mergeObject(categoriesAndItems, object, { inplace: false });
    super(object, options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize("EQUIPMENTSLOTS.MENU.title"),
      classes: [MODULE.id, MODULE.menu],
      id: MODULE.menu,
      template: "modules/deyzerias-equipment-slots/templates/manual-override-config.hbs",
      popOut: true,
      width: 800,
      height: "auto"
    });
  }

  getData(options = {}) {
    const context = super.getData(options);

    context.categories = [];
    for (const [name, obj] of Object.entries(context.object.categories)) {
      context.categories.push({
        name: name,
        label: obj.default === true ? ExtraEquipmentSlots.DefaultEquipmentCategories[name] : obj.label,
        enabled: obj.value ? "checked" : "",
        disabled: obj.default === true ? "disabled" : "",
        custom: !obj.default
      });
    }

    console.debug(context);
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", "[data-action]", this._onAction.bind(this));
  }

  _onAction(event) {
    const action = event.currentTarget.dataset.action;
    if (action == "add-category") {
      const lastChild = $(event.currentTarget).parent().find("[data-id]").last();
      const tempId = foundry.utils.randomID(8);
      const newChild = $(`
        <li class="flexrow" data-id="${tempId}">
          <input class="columnID" type="text" name="categories.${tempId}.name" value="" required="true">
          <input class="columnName" type="text" name="categories.${tempId}.label" value="" required="true">
          <input class="columnEnabled" type="checkbox" name="categories.${tempId}.value" checked>
          <a class="columnDelete" data-action="delete-button">
            <i class="fa-solid fa-trash"></i>
          </a>
        </li>`);
      lastChild.after(newChild);
    }
    if (action == "delete-button") {
      $(event.currentTarget).parent().remove();
    }
  }

  async _updateObject(event, formData) {
    let output = foundry.utils.expandObject(formData);

    console.debug(output);
    const newData = Object.fromEntries(
      Object.entries(
        foundry.utils.mergeObject(game.settings.get(MODULE.id, MODULE.setting.categories), output.categories, { override: true })
      )
        .filter(([key]) => Object.keys(output.categories).includes(key))
        .map(([key, obj]) => {
          if (obj.default === undefined) {
            return [
              obj.name,
              {
                label: obj.label,
                value: obj.value,
                default: false
              }
            ]
          }
          return [key, obj];
        }
        )
    );
    game.settings.set(MODULE.id, MODULE.setting.categories, newData);

    // Save Default items enabled/disabled

    // Add all the New items

    return SettingsConfig.reloadConfirm({ world: true });
  }
}